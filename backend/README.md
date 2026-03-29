# Musica Backend (FastAPI)

Production-oriented MVP backend for collaborative YouTube-powered music streaming.

## Features Implemented

- Supabase email/password auth wrappers (`/auth/signup`, `/auth/login`)
- YouTube Data API v3 search with Redis caching and stale-while-revalidate
- Normalized `tracks` persistence in PostgreSQL
- Playlist CRUD and collaborative membership endpoints
- Playback session state in Redis (`session:{playlist_id}`)
- Redis-backed rate limiting
- Redis pub/sub notifications for playlist + playback events
- Mixpanel server-side `song_played` analytics on authenticated playback starts

## Project Structure

- `core/`: configuration, database, redis, security, rate-limit
- `models/`: SQLAlchemy models
- `schemas/`: Pydantic request/response contracts
- `services/`: business logic
- `routers/`: API routes
- `sql/schema.sql`: DDL schema for Supabase/PostgreSQL

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Mixpanel env

Add these to `backend/.env`:

```bash
MIXPANEL_PROJECT_TOKEN=your_mixpanel_project_token
MIXPANEL_DEBUG=true
```

## API root

`http://localhost:8000/api/v1`
