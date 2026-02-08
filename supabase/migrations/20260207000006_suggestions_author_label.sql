alter table public.suggestions
  add column if not exists author_label text;

comment on column public.suggestions.author_label is 'Display name for author when set (e.g. before they have an account). Falls back to profiles.display_name.';
