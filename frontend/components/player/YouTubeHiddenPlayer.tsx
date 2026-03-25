'use client';

import { useEffect, useRef, useState } from 'react';

import { loadYouTubeAPI } from '@/lib/youtube-player';
import { usePlayerStore } from '@/store/playerStore';

export function YouTubeHiddenPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  type EmbeddedPlayer = {
    getCurrentTime?: () => number;
    loadVideoById: (videoId: string, startSeconds?: number) => void;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  };

  const playerRef = useRef<EmbeddedPlayer | null>(null);
  const activeVideoIdRef = useRef<string | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  
  const pendingSeek = usePlayerStore((state) => state.pendingSeek);
  const clearPendingSeek = usePlayerStore((state) => state.clearPendingSeek);
  const setTimestamp = usePlayerStore((state) => state.setTimestamp);

  useEffect(() => {
    let intervalId: number | undefined;

    void loadYouTubeAPI().then(() => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: '1',
        height: '1',
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => setIsPlayerReady(true)
        }
      });

      intervalId = window.setInterval(() => {
        const player = playerRef.current;
        if (!player?.getCurrentTime) return;
        setTimestamp(player.getCurrentTime());
      }, 1000);
    });

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [setTimestamp]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentTrack) return;

    if (activeVideoIdRef.current !== currentTrack.youtube_id) {
      activeVideoIdRef.current = currentTrack.youtube_id;
      player.loadVideoById(currentTrack.youtube_id, 0);
    }
  }, [currentTrack, isPlayerReady]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !currentTrack) return;

    if (isPlaying) {
      player.playVideo();
      return;
    }

    player.pauseVideo();
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || pendingSeek === null) return;

    player.seekTo(pendingSeek, true);
    clearPendingSeek();
  }, [clearPendingSeek, pendingSeek]);

  return <div ref={containerRef} className="pointer-events-none fixed -left-[9999px] -top-[9999px]" />;
}
