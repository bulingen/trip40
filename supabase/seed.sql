-- Seed data for local development.

-- Allowed emails for invite-only signup
insert into public.allowed_emails (email) values
  ('test@example.com');

-- Note: sign up via the UI first, then run this to create a test trip:
--
--   insert into public.trips (name, owner_id)
--   select 'Trip 40 - Where to?', id from public.profiles limit 1;
--
--   insert into public.suggestions (trip_id, created_by, title, description, lat, lng)
--   select t.id, p.id, s.title, s.description, s.lat, s.lng
--   from public.trips t, public.profiles p,
--   (values
--     ('Barcelona', 'Great food, beaches, and architecture.', 41.3874, 2.1686),
--     ('Lisbon', 'Affordable, amazing pastéis de nata, and great nightlife.', 38.7223, -9.1393),
--     ('Split', 'Stunning coastline, island hopping nearby.', 43.5081, 16.4402)
--   ) as s(title, description, lat, lng)
--   limit 3;
