# Trip 40

Trip planning app for deciding where to go.

## Prerequisites

- Node.js (via asdf)
- Docker (`sudo service docker start` in WSL)
- Supabase CLI: `npm install -D supabase` (already in devDependencies)

## Local development

```bash
npm install

# Start local Supabase (runs Postgres, Auth, Studio via Docker)
npx supabase start

# Copy the Publishable key from the output and update .env.local:
# VITE_SUPABASE_ANON_KEY=<key from supabase start>

# Seed the database (first time, or to reset)
npx supabase db reset

# Start dev server
npm run dev
```

- App: http://127.0.0.1:5173
- Supabase Studio: http://127.0.0.1:54323
- Mailpit (email viewer): http://127.0.0.1:54324

```bash
# Stop local Supabase
npx supabase stop
```

## TypeScript types

Types are auto-generated from the DB schema into `src/lib/database.types.ts`.

```bash
# Regenerate after any migration change (requires local Supabase running)
npm run db:types
```

## Database migrations

Migrations live in `supabase/migrations/`. Applied automatically on `npx supabase start` and `npx supabase db reset`.

```bash
# Reset local DB (reapplies all migrations + seed data)
npx supabase db reset

# Push migrations to remote (production)
npx supabase db push
```

Seed data for local dev is in `supabase/seed.sql`.

## Production

### First-time setup

1. **CDK** (from `deploy/`):
   ```bash
   npm ci
   npx cdk bootstrap
   npx cdk deploy Trip40GitHubActionsRole
   npx cdk deploy Trip40StaticSite
   ```

2. **Supabase** — link CLI to remote project and push migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref quowluomsplgcnaitzle
   npx supabase db push
   ```

3. **Seed production data** — add allowed emails via Supabase Dashboard → SQL Editor:
   ```sql
   insert into public.allowed_emails (email) values
     ('you@example.com'),
     ('friend@example.com');
   ```
   (Don't use `seed.sql` for production — it's for local dev only.)

4. **GitHub repo secrets** — set in GitHub → Settings → Secrets:

   | Secret | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://quowluomsplgcnaitzle.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable key |

### Ongoing deploys

- **App**: push to `main` → GitHub Actions builds + CDK deploys to S3/CloudFront.
- **DB migrations**: `npx supabase db push` (manual, run when you have new migrations).

### Importing suggestions (e.g. from a text dump)

1. Create `scripts/suggestions-input.json` (see `scripts/suggestions-input.example.json`). Format: `[ { "title": "...", "description": "...", "lat": 41.38, "lng": 2.16 }, ... ]`.
2. Get your profile id: Supabase Dashboard → Table Editor → profiles → your row → copy id.
3. Run (use production URL and **service_role** key from Project Settings → API):
   ```bash
   SUPABASE_URL=https://quowluomsplgcnaitzle.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
   TRIP_ID=uuid-of-the-trip \
   CREATED_BY=your-profile-uuid \
   node scripts/import-suggestions.mjs
   ```

## Troubleshooting

- **"Database error querying schema" / "Database error finding user" (local)**  
  1. Do a **full restart** so all containers see the current DB: `npx supabase stop`, then `npx supabase start`, then `npx supabase db reset`. The seed sends `NOTIFY pgrst, 'reload schema'` so PostgREST reloads after migrations; a full stop/start is more reliable.
  2. If it still fails, check the real error: `docker ps` (note container names), then `docker logs supabase_rest_trip40` and `docker logs supabase_auth_trip40` (names may vary). Fix the cause (e.g. missing extension, bad trigger).
  3. As a last resort, remove Supabase project data and start clean: `npx supabase stop --no-backup`, then `npx supabase start` and `npx supabase db reset`.
- **Production:** After pushing new migrations, wait a minute or reload the project in the Supabase dashboard; if it persists, check Dashboard → Logs for errors.
