-- Mockup cache table to store generated Printful mockups
create table if not exists mockup_cache (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references artworks(id) on delete cascade,
  product_type text not null,
  size text not null,
  mockup_url text not null,
  created_at timestamp with time zone default now(),
  -- Unique constraint to prevent duplicates
  unique(artwork_id, product_type, size)
);

-- Index for fast lookups
create index if not exists mockup_cache_lookup_idx on mockup_cache(artwork_id, product_type, size);

-- RLS policies
alter table mockup_cache enable row level security;

-- Allow public read access
create policy "Public read mockup cache" on mockup_cache for select using (true);

-- Allow insert from authenticated users (server-side)
create policy "Insert mockup cache" on mockup_cache for insert with check (true);
