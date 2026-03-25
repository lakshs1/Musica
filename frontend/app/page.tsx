import Link from 'next/link';

import { Card } from '@/components/ui/Card';

const trending = [
  { id: 'dQw4w9WgXcQ', title: 'Global Pop Top 50' },
  { id: 'hTWKbfoikeg', title: 'Indie Pulse Mix' },
  { id: 'fJ9rUzIMcZQ', title: 'Rock Revival Essentials' }
];

export default function HomePage() {
  return (
    <main className="space-y-6 sm:space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl leading-tight tracking-tight text-[#e7f2ff] sm:text-5xl">Minimal music. Built for focus.</h1>
        <p className="max-w-2xl text-base minimal-muted sm:text-lg">
          Musica is now a clean web player for collaborative listening with a black-and-blue interface designed for clarity.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/playlists/1" className="minimal-button">Open web player</Link>
          <Link href="/search" className="minimal-button-secondary">Find tracks</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-2xl text-[#dcecff]">Recent spaces</h2>
          <ul className="space-y-2 text-sm minimal-muted">
            <li>Lo-fi coding session</li>
            <li>Focus synth ambient</li>
            <li>Late-night jazz queue</li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-2xl text-[#dcecff]">Trending now</h2>
          <ul className="space-y-2">
            {trending.map((entry) => (
              <li key={entry.id}>
                <Link href={`/search?q=${entry.title}`} className="text-sm text-[#bfdcff] transition hover:text-[#e7f2ff]">
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </main>
  );
}
