-- Allow any authenticated user to update/delete any suggestion (trip members can edit any suggestion).
-- Author label and created_by remain for display/attribution only.

drop policy if exists "Users can update own suggestions" on public.suggestions;
drop policy if exists "Users can delete own suggestions" on public.suggestions;

create policy "Authenticated users can update any suggestion"
  on public.suggestions for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete any suggestion"
  on public.suggestions for delete
  to authenticated
  using (true);
