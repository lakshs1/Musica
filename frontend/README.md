# Musica Frontend (Next.js)

Apple Music-inspired collaborative streaming UI built with Next.js App Router, TypeScript, TailwindCSS, and Zustand.

## Implemented

- Home, Search, and Playlist pages
- Sticky bottom player bar and hidden YouTube IFrame player
- Debounced search (500ms)
- Skeleton loaders for search
- Zustand stores for auth, search, playlist (optimistic updates), and player state
- API integration against FastAPI backend endpoints
- Mixpanel client-side `song_played` tracking for song-start actions

## Run locally

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Mixpanel env

Add these to `frontend/.env.local`:

```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_project_token
NEXT_PUBLIC_MIXPANEL_DEBUG=true
```
