# Musica

Collaborative music streaming platform powered by YouTube playback.

## Implemented in this iteration

- Production-structured FastAPI backend under `backend/`
- Supabase auth integration
- YouTube search with Redis caching + SWR
- Collaborative playlist APIs
- Playback session state APIs backed by Redis
- Mixpanel song play analytics across frontend and backend

## Mixpanel Workflow

This project tracks song plays with Mixpanel using both a frontend path and a backend path.

### High-level flow

1. A user clicks play in the UI.
2. The frontend player store updates playback state.
3. The frontend analytics helper builds tracking metadata:
   - anonymous `distinct_id`
   - `session_id`
   - `session_started_at`
   - `session_elapsed_seconds`
   - `session_play_count`
   - song metadata like `youtube_id`, `title`, and `duration`
4. The frontend sends the event to the backend proxy endpoint at `/api/v1/analytics/song-played`.
5. The backend forwards that event to Mixpanel using the Python Mixpanel SDK.
6. The frontend also tries to send the same event directly through `mixpanel-browser` when browser tracking is available.
7. If authenticated playback goes through `/api/v1/playlists/{id}/play`, the backend emits an additional user-aware Mixpanel event using the authenticated user identity.

### Why there are two tracking paths

- The frontend Mixpanel SDK gives immediate client-side tracking.
- The backend proxy path is more reliable because browser extensions and privacy tools can block direct calls to Mixpanel.
- The authenticated backend playback route is the best source for per-user analytics because it can attach backend user identity such as `supabase_user_id`.

### Frontend workflow

Frontend environment variables are read from `frontend/.env.local`.

Required values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
NEXT_PUBLIC_MIXPANEL_DEBUG=true
```

Main frontend files:

- `frontend/lib/env.ts`
  - Reads `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, and `NEXT_PUBLIC_MIXPANEL_DEBUG`.
- `frontend/components/analytics/MixpanelProvider.tsx`
  - Initializes Mixpanel once when the app loads.
- `frontend/lib/analytics.ts`
  - Creates the anonymous distinct id.
  - Creates and maintains a playback session in `sessionStorage`.
  - Sends `song_played` events to the backend proxy.
  - Also tries to send the event directly with `mixpanel-browser`.
- `frontend/store/playerStore.ts`
  - Central analytics trigger point.
  - Calls `trackSongPlayed(...)` whenever a song starts through `playTrack`, `playNext`, or `playPrevious`.
- UI entry files:
  - `frontend/components/search/SearchResults.tsx`
  - `frontend/components/home/RecommendationsFeed.tsx`
  - `frontend/components/player/PlayerBar.tsx`
  - `frontend/components/player/PlayerPanel.tsx`
  - These pass context like `source` and `initiated_by` into `playTrack(...)`.
- `frontend/lib/api.ts`
  - Posts analytics payloads to `/analytics/song-played`.

### Frontend identity and session tracking

The frontend tracks two separate identities:

- `distinct_id`
  - Stored in `localStorage`
  - Represents the same browser/device over time
- `session_id`
  - Stored in `sessionStorage`
  - Represents a single tab/session listening window

Additional session properties:

- `session_started_at`
- `session_elapsed_seconds`
- `session_play_count`

This lets Mixpanel answer questions like:

- how many songs were played in one session
- how long a session lasted before each play
- what songs were played during the same listening session

### Backend workflow

Backend environment values are read from `backend/.env`.

Required values:

```env
MIXPANEL_PROJECT_TOKEN=your_mixpanel_project_token
MIXPANEL_DEBUG=true
```

Main backend files:

- `backend/core/config.py`
  - Loads Mixpanel settings from environment variables.
- `backend/services/analytics_service.py`
  - Central server-side Mixpanel service.
  - Creates the Mixpanel Python SDK client.
  - Sends generic events with `analytics.track(...)`.
  - Sends authenticated playback events with `analytics.track_song_play(...)`.
- `backend/routers/analytics.py`
  - Public backend proxy endpoint for frontend analytics.
  - Accepts `POST /api/v1/analytics/song-played`.
  - Forwards the event to Mixpanel.
- `backend/routers/playback.py`
  - Emits Mixpanel song play events when authenticated playback uses `/playlists/{id}/play`.
- `backend/schemas/analytics.py`
  - Defines the analytics proxy request schema.
- `backend/schemas/playback.py`
  - Defines the authenticated playback analytics payload fields.
- `backend/main.py`
  - Mounts the analytics router and other API routers.

### Event name and properties

Primary event name:

- `song_played`

Common properties:

- `distinct_id`
- `session_id`
- `session_started_at`
- `session_elapsed_seconds`
- `session_play_count`
- `source`
- `client_source`
- `initiated_by`
- `playlist_id`
- `track_id`
- `youtube_id`
- `title`
- `duration`

Authenticated backend playback events can also include:

- `user_db_id`
- `supabase_user_id`
- `email`
- `playback_timestamp_seconds`

### Current behavior

- Song plays are tracked from the frontend immediately when a song starts.
- The frontend sends analytics to the backend proxy even if the browser blocks direct Mixpanel requests.
- Direct browser Mixpanel requests may fail because of ad blockers or privacy protection, but the backend proxy path still works.
- The strongest user-level analytics come from the authenticated backend playback route.

### Recommended analytics usage in Mixpanel

To answer questions like "how many times did user 1 play which songs":

1. Filter `song_played`.
2. Filter by `supabase_user_id` or `distinct_id`.
3. Break down by `title` or `youtube_id`.
4. Count total events.

To analyze listening sessions:

1. Filter `song_played`.
2. Group or break down by `session_id`.
3. Inspect `session_play_count` and `session_elapsed_seconds`.

## Next phase

- Build Next.js frontend (`app`, `components`, `hooks`, `lib`, `store`) and connect to this API.
