-- Before-user-created hook: only allow signup if email is in public.allowed_emails.
-- Enable in Dashboard: Authentication → Hooks → Before user created → Postgres function → hook_check_allowed_email

create or replace function public.hook_check_allowed_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_email text;
  is_allowed boolean;
begin
  signup_email := event->'user'->>'email';
  if signup_email is null or signup_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Email is required.',
        'http_code', 400
      )
    );
  end if;

  select exists (
    select 1 from public.allowed_emails
    where lower(trim(email)) = lower(trim(signup_email))
  ) into is_allowed;

  if not is_allowed then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'This email is not on the invite list.',
        'http_code', 403
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

comment on function public.hook_check_allowed_email(jsonb) is 'Auth hook: before user created. Rejects signup if email not in allowed_emails.';

grant execute on function public.hook_check_allowed_email(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_check_allowed_email(jsonb) from authenticated, anon, public;
