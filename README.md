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
