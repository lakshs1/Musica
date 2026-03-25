'use client';

export function PlaylistEditor({ playlistId }: { playlistId: number }) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl text-[#e7f2ff]">Playlist {playlistId}</h1>
        <p className="text-sm text-[#9ab3d1]">Authentication and collaboration have been removed for now. Use Search or the home feed to play tracks instantly.</p>
      </header>
    </div>
  );
}
