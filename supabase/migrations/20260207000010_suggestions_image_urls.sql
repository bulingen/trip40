alter table public.suggestions
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column public.suggestions.image_urls is 'Ordered list of image URLs for the suggestion (e.g. from Unsplash).';
