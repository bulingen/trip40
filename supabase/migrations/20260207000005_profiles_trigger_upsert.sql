-- Make profile trigger idempotent so duplicate insert (e.g. from seed) doesn't break auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do update set display_name = excluded.display_name;
  return new;
end;
$$ language plpgsql security definer;
