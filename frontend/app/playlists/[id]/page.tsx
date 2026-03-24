'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { PlaylistEditor } from '@/components/playlist/PlaylistEditor';
import { Card } from '@/components/ui/Card';

export default function PlaylistPage() {
  const params = useParams<{ id: string }>();
  const playlistId = useMemo(() => Number(params.id), [params.id]);

  return (
    <main>
      <Card>
        <PlaylistEditor playlistId={playlistId} />
      </Card>
    </main>
  );
}
