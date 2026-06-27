# SkillShorts - Mini Short-Video Learning Platform

SkillShorts is a full-stack short-video learning platform built for the Skillcase Intern Assessment. It provides a vertical shorts feed with authentication, likes, comments, bookmarks, Supabase Storage video playback for deployment, and a clean split between routes, controllers, services, middleware, and UI layers.

## Tech Stack

- Frontend: React, Vite, React Router, Redux Toolkit, Axios, Framer Motion
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt, Multer
- Database hosting: PostgreSQL on Supabase or Neon

## Assessment Coverage

- JWT authentication with register, login, and protected profile endpoint
- Password hashing with bcrypt
- Express auth middleware and centralized error middleware
- PostgreSQL schema with primary keys, foreign keys, composite keys, and category index
- Video endpoints for create, list, and detail views
- Like, comment, and bookmark endpoints
- Duplicate likes/bookmarks prevented by composite primary keys
- Transaction-based like toggling with atomic `like_count` updates
- Supabase Storage public video URLs for reliable Render/Vercel deployment
- React vertical scroll-snap shorts feed
- Autoplay when a video enters view using Intersection Observer
- Overlay actions for like, comment, and bookmark
- Slide-up comment sheet with Framer Motion
- Redux Toolkit authentication state
- Centralized Axios API client with JWT injection
- Loading, error, and empty states
- Video files and environment files excluded from git

## Project Structure

```text
skill-case/
  backend/
    models/
      schema.sql
    scripts/
      migrate.js
      seed-videos.js
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
      utils/
    uploads/
      .gitkeep
    server.js
  frontend/
    public/
    src/
      api/
      components/
      hooks/
      pages/
      redux/
      App.jsx
      main.jsx
      style.css
```

## Prerequisites

- Node.js 18 or newer
- PostgreSQL database URL from Supabase or Neon
- The three assessment video files uploaded to a public Supabase Storage bucket

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
SUPABASE_STORAGE_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/YOUR_BUCKET
```

Apply the database schema:

```bash
npm run migrate
```

Create or update the public Supabase Storage bucket:

```bash
npm run storage:setup
```

Upload the three provided videos to your Supabase Storage bucket. The seed script expects these filenames when `SUPABASE_STORAGE_BASE_URL` is used:

```text
Introduction_German.mp4
Learning_German.mp4
Story_German.mp4
```

For example, if your bucket is public and named `videos`, use:

```env
SUPABASE_STORAGE_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/videos
```

You can also override any individual video URL:

```env
INTRODUCTION_GERMAN_VIDEO_URL=https://...
LEARNING_GERMAN_VIDEO_URL=https://...
STORY_GERMAN_VIDEO_URL=https://...
```

Seed the video metadata:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

If the backend runs on a different URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

For Vercel, set `VITE_API_URL` to your Render backend URL, for example:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

## Deployment

### Render Backend

Create a Render Web Service from this repository.

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Set these environment variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.sxtlfczkxkupkfzvynhb:[YOUR_DB_PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
JWT_SECRET=[YOUR_STRONG_SECRET]
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://[YOUR_VERCEL_APP].vercel.app
SUPABASE_STORAGE_BASE_URL=https://sxtlfczkxkupkfzvynhb.supabase.co/storage/v1/object/public/videos
```

Use the Supabase pooler URL above for Render. Do not use the direct `db.sxtlfczkxkupkfzvynhb.supabase.co` URL on Render, because it can resolve to IPv6 and fail with `ENETUNREACH`.

Keep `FRONTEND_URL` without a trailing slash:

```text
https://skillcase-assessment.vercel.app
```

After the first deploy, run these once from your machine:

```bash
cd backend
npm run migrate
npm run storage:setup
npm run seed
```

### Vercel Frontend

Create a Vercel project from this repository.

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set this environment variable:

```env
VITE_API_URL=https://[YOUR_RENDER_SERVICE].onrender.com
```

After Vercel gives you the final frontend URL, add that exact URL to Render's `FRONTEND_URL` value and redeploy the backend.

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Login and receive a JWT |
| GET | `/auth/me` | Yes | Get the current authenticated user |

### Videos

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/videos` | Yes | Create/upload a video record |
| GET | `/videos` | Optional | List shorts ordered by latest first |
| GET | `/videos/:id` | Optional | Get one short |
| POST | `/videos/:id/like` | Yes | Toggle like |
| POST | `/videos/:id/comment` | Yes | Add a comment |
| GET | `/videos/:id/comments` | No | List comments for a video |
| POST | `/videos/:id/bookmark` | Yes | Toggle bookmark |
| GET | `/videos/bookmarked/me` | Yes | List the user's saved videos |

## Run Checks

Build the frontend:

```bash
cd frontend
npm run build
```

Check backend startup after `.env` is configured:

```bash
cd backend
npm start
```

The health endpoint should respond with:

```json
{ "status": "ok" }
```

## Notes

- Do not commit `.env`, `node_modules`, `dist`, PDFs, images, or video files.
- The assessment videos should not be committed to git. For deployment, upload them to Supabase Storage and seed their public URLs.
- The SQL schema is included at `backend/models/schema.sql`.
