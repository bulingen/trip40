-- Seed data for local development.
-- Applied on: npx supabase db reset

-- Allowed emails
insert into public.allowed_emails (email) values
  ('test@example.com'),
  ('friend@example.com');

-- Create test user (email: test@example.com, password: password123)
-- GoTrue requires email_change and email_change_token_new to be non-null (empty string)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, email_change, email_change_token_new,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '', '',
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(), now(), ''
);

-- GoTrue scans all string columns as non-nullable; set any we didn't insert to ''
update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where id = '00000000-0000-0000-0000-000000000001';

-- Identity row (required for sign-in to work)
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  created_at, updated_at, last_sign_in_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "test@example.com"}',
  'email',
  now(), now(), now()
);

-- Second test user (email: friend@example.com, password: password123)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, email_change, email_change_token_new,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token
) values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'friend@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '', '',
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Friend"}',
  now(), now(), ''
);

update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where id = '00000000-0000-0000-0000-000000000002';

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  created_at, updated_at, last_sign_in_at
) values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub": "00000000-0000-0000-0000-000000000002", "email": "friend@example.com"}',
  'email',
  now(), now(), now()
);

-- Profiles are auto-created by the trigger; give first user permission to create voting rounds
update public.profiles set can_create_voting_round = true where id = '00000000-0000-0000-0000-000000000001';

-- Test trip
insert into public.trips (id, name, owner_id) values
  ('00000000-0000-0000-0000-000000000010',
   'Trip 40 - Where to?',
   '00000000-0000-0000-0000-000000000001');

-- Test suggestions (main_image_url for local preview)
insert into public.suggestions (trip_id, created_by, title, description, lat, lng, main_image_url) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Barcelona', 'Great food, beaches, and architecture. Sagrada Familia is a must.', 41.3874, 2.1686,
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Lisbon', 'Affordable, amazing pastéis de nata, and great nightlife.', 38.7223, -9.1393,
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Split', 'Stunning coastline, Diocletian''s Palace, island hopping nearby.', 43.5081, 16.4402,
   'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80');

-- Force PostgREST to reload schema (fixes "database error querying schema" after reset)
notify pgrst, 'reload schema';
