create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  lat float8,
  lng float8,
  created_at timestamptz not null default now()
);

alter table public.suggestions enable row level security;

create policy "Authenticated users can read suggestions"
  on public.suggestions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert suggestions"
  on public.suggestions for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Users can update own suggestions"
  on public.suggestions for update
  to authenticated
  using (created_by = auth.uid());

create policy "Users can delete own suggestions"
  on public.suggestions for delete
  to authenticated
  using (created_by = auth.uid());
