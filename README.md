# Trip 40

Trip planning app for deciding where to go.

## Prerequisites

- Node.js (via asdf)
- Docker (`sudo service docker start` in WSL)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started): `npm install -g supabase`

## Local development

```bash
# Start local Supabase (runs Postgres, Auth, Studio via Docker)
supabase start

# Install dependencies and start dev server
npm install
npm run dev
```

Local Supabase Studio: http://127.0.0.1:54323
Local Inbucket (email viewer): http://127.0.0.1:54324
App: http://127.0.0.1:5173

`.env.local` is pre-configured for local Supabase. The local anon key is a well-known test key.

```bash
# Stop local Supabase
supabase stop
```

## Database migrations

Migrations live in `supabase/migrations/`. They are applied automatically on `supabase start` and `supabase db reset`.

```bash
# Reset local DB (reapplies all migrations + seed data)
supabase db reset

# Push migrations to remote (production)
supabase db push
```

Seed data for local dev is in `supabase/seed.sql`.

## Production

### GitHub repo secrets

Set these in GitHub → Settings → Secrets:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://quowluomsplgcnaitzle.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Deploy

Push to `main` triggers GitHub Actions: build app → CDK deploy to S3/CloudFront.

DB migrations are deployed manually via `supabase db push`.

### First-time setup

1. Bootstrap CDK: `cd deploy && npm ci && npx cdk bootstrap`
2. Deploy OIDC role: `npx cdk deploy Trip40GitHubActionsRole`
3. Deploy static site: `npx cdk deploy Trip40StaticSite`
4. After first deploy, GitHub Actions handles subsequent deploys on push to main.
