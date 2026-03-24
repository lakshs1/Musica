# Musica

Collaborative music streaming platform powered by YouTube playback.

## Implemented

- **Backend (`backend/`)**: FastAPI + Supabase + PostgreSQL + Redis with caching, playlist collaboration, and playback session APIs.
- **Frontend (`frontend/`)**: Next.js App Router + TypeScript + Tailwind + Zustand with Apple Music-inspired UI and YouTube IFrame-based playback shell.

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
