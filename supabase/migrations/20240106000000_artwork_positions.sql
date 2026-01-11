-- Add artwork_positions column to store positioning for each product type
-- Format: { "poster": { width, height, top, left }, "canvas": {...}, "framed": {...} }
alter table artworks add column if not exists artwork_positions jsonb default '{}'::jsonb;
