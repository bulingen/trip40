-- Replace image_urls (array) with single main_image_url. Keep first existing image if any.
alter table public.suggestions
  add column if not exists main_image_url text;

update public.suggestions
set main_image_url = (image_urls->>0)
where image_urls is not null and jsonb_array_length(image_urls) > 0;

alter table public.suggestions
  drop column if exists image_urls;

comment on column public.suggestions.main_image_url is 'URL for the main/hero image of the suggestion.';
