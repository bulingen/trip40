create table public.allowed_emails (
  email text primary key
);

alter table public.allowed_emails enable row level security;

create policy "Anyone can read allowed emails"
  on public.allowed_emails for select
  using (true);
