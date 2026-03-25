import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

import { AppBootstrap } from '@/components/AppBootstrap';
import { PlayerBar } from '@/components/player/PlayerBar';
import { PwaRegister } from '@/components/PwaRegister';
import { YouTubeHiddenPlayer } from '@/components/player/YouTubeHiddenPlayer';

import './globals.css';

export const metadata: Metadata = {
  title: 'Musica',
  description: 'Minimal collaborative YouTube music streaming player',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    title: 'Musica',
    capable: true,
    statusBarStyle: 'black'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppBootstrap />
        <PwaRegister />
        <YouTubeHiddenPlayer />
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-36 pt-5 sm:px-6 sm:pt-8">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-3xl tracking-tight text-[#dcecff]">Musica</Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <Link href="/" className="minimal-button-secondary">Home</Link>
              <Link href="/search" className="minimal-button-secondary">Search</Link>
            </nav>
          </header>
          {children}
        </div>
        <PlayerBar />
      </body>
    </html>
  );
}
