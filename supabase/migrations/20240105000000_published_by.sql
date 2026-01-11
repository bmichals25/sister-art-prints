-- Add published_by column to track who uploaded each artwork
alter table artworks add column if not exists published_by text;
alter table artworks add column if not exists published_by_email text;
