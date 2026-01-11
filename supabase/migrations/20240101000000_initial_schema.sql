-- Supabase schema for Art Print Shop
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cfvtatiddqeeknxdrqzp/sql

-- ============================================
-- STEP 1: Enable extensions
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- STEP 2: Create tables
-- ============================================

-- Artworks table
create table if not exists artworks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  artist_name text not null,
  image_url text,
  thumbnail_url text,
  price_base decimal(10,2) not null default 29.99,
  featured boolean default false,
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Print options table (maps artworks to Printful variants)
create table if not exists print_options (
  id uuid primary key default uuid_generate_v4(),
  artwork_id uuid references artworks(id) on delete cascade,
  printful_variant_id integer not null,
  product_type text not null check (product_type in ('poster', 'canvas', 'framed', 'metal')),
  size text not null,
  price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Orders table
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique,
  printful_order_id text,
  customer_email text not null,
  customer_name text,
  shipping_address jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Order items table
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  artwork_id uuid references artworks(id),
  print_option_id uuid references print_options(id),
  quantity integer not null default 1,
  price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- STEP 3: Create indexes
-- ============================================
create index if not exists idx_artworks_featured on artworks(featured);
create index if not exists idx_artworks_created on artworks(created_at desc);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_customer on orders(customer_email);

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================
alter table artworks enable row level security;
alter table print_options enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

-- Artworks: Anyone can read, only authenticated users can modify
create policy "Artworks are viewable by everyone" on artworks
  for select using (true);

create policy "Authenticated users can insert artworks" on artworks
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update artworks" on artworks
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete artworks" on artworks
  for delete using (auth.role() = 'authenticated');

-- Print options: Anyone can read
create policy "Print options are viewable by everyone" on print_options
  for select using (true);

-- Orders: Anyone can insert (for checkout), only authenticated can view all
create policy "Orders insertable by anyone" on orders
  for insert with check (true);

create policy "Authenticated users can view orders" on orders
  for select using (auth.role() = 'authenticated');

-- ============================================
-- STEP 6: Create helper functions
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_artworks_updated_at on artworks;
create trigger update_artworks_updated_at
  before update on artworks
  for each row execute function update_updated_at_column();

drop trigger if exists update_orders_updated_at on orders;
create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

-- ============================================
-- STEP 7: Store settings table for customization
-- ============================================

create table if not exists store_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text default 'KatiaPrints',
  tagline text default 'Original artwork, beautifully printed',
  primary_color text default '#2d2a26',
  secondary_color text default '#fff8f3',
  accent_color text default '#e8a87c',
  font_heading text default 'Playfair Display',
  font_body text default 'Inter',
  vibe text default 'minimal' check (vibe in ('minimal', 'warm', 'bold', 'elegant', 'playful')),
  hero_title text default 'Original Art, Beautiful Prints',
  hero_subtitle text default 'Discover our curated collection of original artwork, available as museum-quality prints delivered to your door.',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Only one settings row
create unique index if not exists idx_store_settings_singleton on store_settings ((true));

-- RLS for store settings
alter table store_settings enable row level security;

create policy "Store settings are viewable by everyone" on store_settings
  for select using (true);

create policy "Authenticated users can update store settings" on store_settings
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can insert store settings" on store_settings
  for insert with check (auth.role() = 'authenticated');

-- Insert default settings
insert into store_settings (id) values (uuid_generate_v4()) on conflict do nothing;

-- ============================================
-- STEP 8: Create storage bucket (run separately in Storage section)
-- ============================================
-- Go to Storage in Supabase Dashboard and create a bucket called "artworks"
-- Then run this SQL to set up the storage policies:

-- Note: Run this AFTER creating the "artworks" bucket in the Storage UI
/*
insert into storage.buckets (id, name, public) values ('artworks', 'artworks', true);

create policy "Anyone can view artwork images"
on storage.objects for select
using ( bucket_id = 'artworks' );

create policy "Authenticated users can upload artwork images"
on storage.objects for insert
with check ( bucket_id = 'artworks' AND auth.role() = 'authenticated' );

create policy "Authenticated users can delete artwork images"
on storage.objects for delete
using ( bucket_id = 'artworks' AND auth.role() = 'authenticated' );
*/

-- ============================================
-- Done! Now create an admin user:
-- Go to Authentication > Users > Add User
-- Enter your email and password
-- ============================================
