import type { Metadata } from 'next';
import Link from 'next/link';

import { AppBootstrap } from '@/components/AppBootstrap';
import { PlayerBar } from '@/components/player/PlayerBar';
import { YouTubeHiddenPlayer } from '@/components/player/YouTubeHiddenPlayer';

import './globals.css';

export const metadata: Metadata = {
  title: 'Musica',
  description: 'Collaborative YouTube music streaming'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppBootstrap />
        <YouTubeHiddenPlayer />
        <div className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">Musica</Link>
            <nav className="flex items-center gap-4 text-sm text-white/70">
              <Link href="/">Home</Link>
              <Link href="/search">Search</Link>
            </nav>
          </header>
          {children}
        </div>
        <PlayerBar />
      </body>
    </html>
  );
}
