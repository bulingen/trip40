-- Seed data for local development.
-- Applied on: npx supabase db reset

-- Allowed emails
insert into public.allowed_emails (email) values
  ('test@example.com');

-- Create test user (email: test@example.com, password: password123)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(), now(), ''
);

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

-- Profile is auto-created by the trigger.

-- Test trip
insert into public.trips (id, name, owner_id) values
  ('00000000-0000-0000-0000-000000000010',
   'Trip 40 - Where to?',
   '00000000-0000-0000-0000-000000000001');

-- Test suggestions
insert into public.suggestions (trip_id, created_by, title, description, lat, lng) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Barcelona', 'Great food, beaches, and architecture. Sagrada Familia is a must.', 41.3874, 2.1686),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Lisbon', 'Affordable, amazing pastéis de nata, and great nightlife.', 38.7223, -9.1393),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Split', 'Stunning coastline, Diocletian''s Palace, island hopping nearby.', 43.5081, 16.4402);

-- Force PostgREST to reload schema (fixes "database error querying schema" after reset)
notify pgrst, 'reload schema';
