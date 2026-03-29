'use client';

import mixpanel from 'mixpanel-browser';

import { api } from '@/lib/api';
import { env } from '@/lib/env';
import type { PlayableTrack, PlaybackAnalyticsContext } from '@/types';

let hasInitialized = false;

function getAnonymousDistinctId() {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const key = 'musica_mixpanel_distinct_id';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const nextId = window.crypto?.randomUUID?.() ?? `anon-${Date.now()}`;
  window.localStorage.setItem(key, nextId);
  return nextId;
}

function getPlaybackSession() {
  if (typeof window === 'undefined') {
    return {
      sessionId: 'server-session',
      sessionStartedAt: new Date().toISOString(),
      sessionElapsedSeconds: 0,
      sessionPlayCount: 0
    };
  }

  const sessionIdKey = 'musica_play_session_id';
  const sessionStartedAtKey = 'musica_play_session_started_at';
  const sessionPlayCountKey = 'musica_play_session_play_count';

  let sessionId = window.sessionStorage.getItem(sessionIdKey);
  let sessionStartedAt = window.sessionStorage.getItem(sessionStartedAtKey);

  if (!sessionId || !sessionStartedAt) {
    sessionId = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
    sessionStartedAt = new Date().toISOString();
    window.sessionStorage.setItem(sessionIdKey, sessionId);
    window.sessionStorage.setItem(sessionStartedAtKey, sessionStartedAt);
    window.sessionStorage.setItem(sessionPlayCountKey, '0');
  }

  const nextPlayCount = Number(window.sessionStorage.getItem(sessionPlayCountKey) ?? '0') + 1;
  window.sessionStorage.setItem(sessionPlayCountKey, String(nextPlayCount));

  const startedAtMs = new Date(sessionStartedAt).getTime();
  const sessionElapsedSeconds = Number.isFinite(startedAtMs)
    ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
    : 0;

  return {
    sessionId,
    sessionStartedAt,
    sessionElapsedSeconds,
    sessionPlayCount: nextPlayCount
  };
}

function isEnabled() {
  return Boolean(env.mixpanelToken);
}

export function initializeAnalytics() {
  if (hasInitialized || !isEnabled()) {
    if (!isEnabled() && env.mixpanelDebug) {
      console.log('[mixpanel] init skipped because NEXT_PUBLIC_MIXPANEL_TOKEN is missing');
    }
    return;
  }

  mixpanel.init(env.mixpanelToken, {
    debug: env.mixpanelDebug,
    persistence: 'localStorage',
    track_pageview: false
  });

  hasInitialized = true;

  if (env.mixpanelDebug) {
    console.log('[mixpanel] initialized');
  }
}

export function trackSongPlayed(track: PlayableTrack, context: PlaybackAnalyticsContext = {}) {
  const distinctId = getAnonymousDistinctId();
  const playbackSession = getPlaybackSession();

  void api
    .trackSongPlayed({
      distinct_id: distinctId,
      session_id: playbackSession.sessionId,
      session_started_at: playbackSession.sessionStartedAt,
      session_elapsed_seconds: playbackSession.sessionElapsedSeconds,
      session_play_count: playbackSession.sessionPlayCount,
      playlist_id: context.playlistId,
      track_id: context.trackId,
      youtube_id: track.youtube_id,
      title: track.title,
      duration: track.duration,
      source: context.source ?? 'frontend_player',
      initiated_by: context.initiatedBy ?? 'play_track'
    })
    .then(() => {
      if (env.mixpanelDebug) {
        console.log('[mixpanel] backend proxy song_played sent', {
          distinctId,
          sessionId: playbackSession.sessionId,
          sessionElapsedSeconds: playbackSession.sessionElapsedSeconds,
          title: track.title
        });
      }
    })
    .catch((error) => {
      console.error('[mixpanel] backend proxy failed', error);
    });

  if (!isEnabled()) {
    if (env.mixpanelDebug) {
      console.log('[mixpanel] skipped song_played because NEXT_PUBLIC_MIXPANEL_TOKEN is missing');
    }
    return;
  }

  initializeAnalytics();

  const properties = {
    distinct_id: distinctId,
    session_id: playbackSession.sessionId,
    session_started_at: playbackSession.sessionStartedAt,
    session_elapsed_seconds: playbackSession.sessionElapsedSeconds,
    session_play_count: playbackSession.sessionPlayCount,
    source: context.source ?? 'frontend_player',
    playlist_id: context.playlistId,
    track_id: context.trackId,
    initiated_by: context.initiatedBy ?? 'play_track',
    youtube_id: track.youtube_id,
    title: track.title,
    duration: track.duration
  };

  mixpanel.track('song_played', properties);

  if (env.mixpanelDebug) {
    console.log('[mixpanel] song_played', properties);
  }
}
