-- Seed data for local development.

-- Allowed emails for invite-only signup
insert into public.allowed_emails (email) values
  ('test@example.com');

-- Create a test user (password: "password123")
-- This uses Supabase's auth.users directly for seeding
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
);

-- The profile is auto-created by the trigger.

-- Create a test trip
insert into public.trips (id, name, owner_id) values
  ('00000000-0000-0000-0000-000000000010', 'Trip 40 - Where to?', '00000000-0000-0000-0000-000000000001');

-- Create some dummy suggestions
insert into public.suggestions (trip_id, created_by, title, description, lat, lng) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Barcelona', 'Great food, beaches, and architecture. Sagrada Familia is a must.', 41.3874, 2.1686),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Lisbon', 'Affordable, amazing pastéis de nata, and great nightlife.', 38.7223, -9.1393),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Split', 'Stunning coastline, Diocletian''s Palace, island hopping nearby.', 43.5081, 16.4402);
