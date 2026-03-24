import Link from 'next/link';

import { Card } from '@/components/ui/Card';

const trending = [
  { id: 'dQw4w9WgXcQ', title: 'Global Pop Top 50' },
  { id: 'hTWKbfoikeg', title: 'Indie Pulse Mix' },
  { id: 'fJ9rUzIMcZQ', title: 'Rock Revival Essentials' }
];

export default function HomePage() {
  return (
    <main className="space-y-6">
      <section>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">Listen together.</h1>
        <p className="max-w-2xl text-white/70">
          Build collaborative playlists, search YouTube instantly, and stream with synchronized control.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-medium">Recent</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Lo-fi coding session</li>
            <li>Focus synth ambient</li>
            <li>Late-night jazz queue</li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-medium">Trending</h2>
          <ul className="space-y-2">
            {trending.map((entry) => (
              <li key={entry.id}>
                <Link href={`/search?q=${entry.title}`} className="text-sm text-white/80 hover:text-white">
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <Link href="/playlists/1" className="inline-flex rounded-2xl bg-white px-5 py-2 text-sm font-medium text-black">
          Open collaborative playlist
        </Link>
      </section>
    </main>
  );
}
