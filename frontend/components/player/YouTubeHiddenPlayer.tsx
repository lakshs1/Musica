'use client';

import { useEffect, useRef } from 'react';

import { loadYouTubeAPI } from '@/lib/youtube-player';
import { usePlayerStore } from '@/store/playerStore';

export function YouTubeHiddenPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const timestamp = usePlayerStore((state) => state.timestamp);
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

    player.loadVideoById(currentTrack.youtube_id, timestamp);
    if (!isPlaying) {
      player.pauseVideo();
    }
  }, [currentTrack, isPlaying, timestamp]);

  return <div ref={containerRef} className="pointer-events-none fixed -left-[9999px] -top-[9999px]" />;
}
