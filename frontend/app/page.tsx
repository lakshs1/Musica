import Link from 'next/link';

import { RecommendationsFeed } from '@/components/home/RecommendationsFeed';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="space-y-8 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] px-6 py-8 shadow-2xl sm:px-8 sm:py-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9ebee3]">Curated Motion</p>
          <h1 className="text-4xl leading-tight tracking-tight text-[#f6f8fc] sm:text-6xl">
            Darker. Louder. Built like a living mixtape.
          </h1>
          <p className="max-w-2xl text-base text-[#c8d3df] sm:text-lg">
            Musica now leans into cinematic black surfaces, expressive playlist covers, and faster YouTube discovery so every section feels like a mood, not a spreadsheet.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search" className="minimal-button">Start discovering</Link>
          <Link href="/playlists/1" className="minimal-button-secondary">Open player</Link>
        </div>
      </section>

      <section>
        <Card>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#9ebee3]">Fresh Picks</p>
            <h2 className="mt-2 text-3xl text-[#f5f7fb]">Playlist covers with a pulse</h2>
          </div>
          <RecommendationsFeed />
        </Card>
      </section>
    </main>
  );
}
