# Musica Frontend (Next.js)

Apple Music-inspired collaborative streaming UI built with Next.js App Router, TypeScript, TailwindCSS, and Zustand.

## Implemented

- Home, Search, and Playlist pages
- Sticky bottom player bar and hidden YouTube IFrame player
- Debounced search (500ms)
- Skeleton loaders for search
- Zustand stores for auth, search, playlist (optimistic updates), and player state
- API integration against FastAPI backend endpoints

## Run locally

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
