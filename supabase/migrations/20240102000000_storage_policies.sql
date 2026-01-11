-- Make bucket public
update storage.buckets set public = true where id = 'artworks';

-- Storage policies
create policy "Public read" on storage.objects for select using (bucket_id = 'artworks');
create policy "Auth insert" on storage.objects for insert with check (bucket_id = 'artworks');
create policy "Auth update" on storage.objects for update using (bucket_id = 'artworks');
create policy "Auth delete" on storage.objects for delete using (bucket_id = 'artworks');
