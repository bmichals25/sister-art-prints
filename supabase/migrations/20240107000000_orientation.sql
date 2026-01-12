-- Add orientation column to artworks table
alter table artworks add column if not exists orientation text default 'portrait' check (orientation in ('portrait', 'landscape'));

-- Add orientation column to mockup_cache table
alter table mockup_cache add column if not exists orientation text default 'portrait' check (orientation in ('portrait', 'landscape'));

-- Drop old unique constraint and index if they exist
drop index if exists mockup_cache_lookup_idx;
alter table mockup_cache drop constraint if exists mockup_cache_artwork_id_product_type_size_key;

-- Create new unique constraint including orientation
alter table mockup_cache add constraint mockup_cache_unique_key unique(artwork_id, product_type, size, orientation);

-- Create new index for fast lookups including orientation
create index if not exists mockup_cache_lookup_idx on mockup_cache(artwork_id, product_type, size, orientation);
