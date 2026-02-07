create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;

create policy "Authenticated users can read all trips"
  on public.trips for select
  to authenticated
  using (true);
