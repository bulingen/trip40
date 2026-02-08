# TODO

## Tech Stack
- Frontend: React (Vite)
- Backend/DB/Auth: Supabase (Postgres + Auth + Realtime + Storage)
- Maps: Google Maps JavaScript API
- Infra: AWS CDK (CloudFront + S3 + Route 53)
- CI/CD: GitHub Actions → CDK deploy on push to main

---

## Phase 0 — Pipeline
- [x] Scaffold React app (Vite)
- [x] CDK stack: S3 bucket + CloudFront distribution (no Route 53 yet, using cloudfront.net)
- [x] GitHub Actions: build → cdk deploy on push to main
- [x] Verify: push to main → app live on CloudFront

## Phase 1 — Core (showcase suggestions)
- [x] Supabase project setup + auth (email/password)
- [x] Invite-only: email allow-list, reject unknown sign-ups
- [x] Trip entity + suggestions table in Supabase
- [x] Interactive Google Map with markers per suggestion
- [x] Side panel / list view, synced with map
- [x] Detail view: pitch, street view, restaurants links
- [ ] Add / edit / delete suggestions
- [x] Tailwind and DaisyUI
- [x] Pretty domain name

## Phase 2 — Collaborate
- [ ] Star/vote suggestions
- [ ] Realtime sync (Supabase Realtime)
- [ ] Search (full-text across pitch content)
- [ ] Filter by vote count (grey out low-voted, not hidden)
- [ ] Comments/discussion per suggestion

## Phase 3 — Decide
- [ ] Voting rounds with deadlines
- [ ] Freeze date: no new suggestions after X, voting only
- [ ] Decision deadline with visible countdown
- [ ] Notifications: daily digest + manual "notify others" button
- [ ] Voting results email when round closes

## Phase 4 — Polish
- [ ] Tags (budget tier, flight time, season, visa, etc.)
- [ ] Comparison mode: side-by-side 2 suggestions
- [ ] Bracket tournament (head-to-head elimination)

---

## Notes
- Scope: keep it small, goal is to narrow down, not expand
- Custom domain via Route 53 (already owned)
- Notifications: consider Discord webhook to a private server instead of email — much simpler