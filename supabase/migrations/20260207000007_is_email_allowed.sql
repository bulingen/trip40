-- Invite check for sign-up: runs with definer rights so anon can call it
create or replace function public.is_email_allowed(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.allowed_emails
    where lower(trim(email)) = lower(trim(check_email))
  );
$$;

comment on function public.is_email_allowed(text) is 'Used by sign-up to check invite list; callable by anon.';
