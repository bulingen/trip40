-- Play: Reactions — profiles flag and reactions tables

alter table public.profiles
  add column if not exists can_create_voting_round boolean not null default false;

create table public.reactions_rounds (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  is_open boolean not null default true
);

create table public.reactions_round_suggestions (
  reactions_round_id uuid not null references public.reactions_rounds(id) on delete cascade,
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  primary key (reactions_round_id, suggestion_id)
);

create table public.reactions (
  reactions_round_id uuid not null references public.reactions_rounds(id) on delete cascade,
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score >= -1 and score <= 2),
  created_at timestamptz not null default now(),
  unique (reactions_round_id, suggestion_id, user_id)
);

alter table public.reactions_rounds enable row level security;
alter table public.reactions_round_suggestions enable row level security;
alter table public.reactions enable row level security;

create policy "Authenticated users can read reactions_rounds"
  on public.reactions_rounds for select to authenticated using (true);

create policy "Authenticated users can insert reactions_rounds"
  on public.reactions_rounds for insert to authenticated with check (true);

create policy "Authenticated users can update reactions_rounds"
  on public.reactions_rounds for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete reactions_rounds"
  on public.reactions_rounds for delete to authenticated using (true);

create policy "Authenticated users can read reactions_round_suggestions"
  on public.reactions_round_suggestions for select to authenticated using (true);

create policy "Authenticated users can insert reactions_round_suggestions"
  on public.reactions_round_suggestions for insert to authenticated with check (true);

create policy "Authenticated users can delete reactions_round_suggestions"
  on public.reactions_round_suggestions for delete to authenticated using (true);

create policy "Authenticated users can read reactions"
  on public.reactions for select to authenticated using (true);

create policy "Users can insert own reactions"
  on public.reactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own reactions"
  on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own reactions"
  on public.reactions for delete to authenticated
  using (user_id = auth.uid());
