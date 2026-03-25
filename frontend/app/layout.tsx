import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

import { AppLogo } from '@/components/AppLogo';
import { PlayerBar } from '@/components/player/PlayerBar';
import { PlayerPanel } from '@/components/player/PlayerPanel';
import { PwaRegister } from '@/components/PwaRegister';
import { YouTubeHiddenPlayer } from '@/components/player/YouTubeHiddenPlayer';

import './globals.css';

export const metadata: Metadata = {
  title: 'Musica',
  description: 'Minimal collaborative YouTube music streaming player',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  },
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
        <PwaRegister />
        <YouTubeHiddenPlayer />
        <PlayerPanel />
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-36 pt-5 sm:px-6 sm:pt-8">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-3xl tracking-tight text-[#f6f8fc]">
              <AppLogo size={44} showWordmark />
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-3">
              <Link href="/" className="minimal-button-secondary">Home</Link>
              <Link href="/search" className="minimal-button-secondary">Search</Link>
            </nav>
          </header>
          {children}
          <footer className="mt-14 border-t border-white/8 pt-6 text-center text-sm text-[#97a5b5]">
            lakshya (<a href="https://lakshyanain.in" target="_blank" rel="noreferrer" className="text-[#f4f7fb] transition hover:text-[#ffd400]">lakshyanain.in</a>) IG social - <a href="https://instagram.com/lakshya.naiin" target="_blank" rel="noreferrer" className="text-[#f4f7fb] transition hover:text-[#ffd400]">lakshya.naiin</a>
          </footer>
        </div>
        <PlayerBar />
      </body>
    </html>
  );
}
