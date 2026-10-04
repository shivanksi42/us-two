# us, always

A private memory journal for two: events/trips, daily timeline, calendar view, photo captions and coloured text highlights. It has a standalone FastAPI backend in `backend/`.

## Run locally

In terminal one, start the API:

```bash
cd backend
source .venv/bin/activate  # first time: create it with python3 -m venv .venv && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In terminal two, start the website:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Use **Create the shared account** once, then both of you use that same email/password.

## Connect the free services

1. For a free hosted database, create a Supabase project and use its Postgres connection string as `DATABASE_URL` in `backend/.env`. The separate API owns the tables and authentication; it does not use Supabase Auth.
2. Add a long `JWT_SECRET`, the deployed Vercel URL as `FRONTEND_ORIGIN`, and your Cloudinary credentials to `backend/.env`.
3. Photo uploads are signed by the authenticated backend. The Cloudinary API secret remains only on the backend—never in a `VITE_` frontend variable.
4. To enable Google Sign-In, create a **Web application** OAuth client in Google Cloud. Add your frontend URLs under **Authorized JavaScript origins**, then set its public client ID as `GOOGLE_CLIENT_ID` in both Vercel projects (and `backend/.env` for local API use).

## Deploy free

Deploy the frontend to Vercel. Deploy `backend/` to Render, Railway, or Fly.io and set the backend environment variables there. In Vercel, set `API_URL=https://your-api-domain`. Vercel will detect Vite; build command: `npm run build`, output directory: `dist`.
