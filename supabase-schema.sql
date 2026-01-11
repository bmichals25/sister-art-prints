-- Supabase schema for Art Print Shop
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Artworks table
create table artworks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  artist_name text not null,
  image_url text not null,
  thumbnail_url text,
  price_base decimal(10,2) not null default 29.99,
  featured boolean default false,
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Print options table (maps artworks to Printful variants)
create table print_options (
  id uuid primary key default uuid_generate_v4(),
  artwork_id uuid references artworks(id) on delete cascade,
  printful_variant_id integer not null,
  product_type text not null check (product_type in ('poster', 'canvas', 'framed', 'metal')),
  size text not null,
  price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Orders table
create table orders (
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
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  artwork_id uuid references artworks(id),
  print_option_id uuid references print_options(id),
  quantity integer not null default 1,
  price decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_artworks_featured on artworks(featured);
create index idx_artworks_created on artworks(created_at desc);
create index idx_orders_status on orders(status);
create index idx_orders_customer on orders(customer_email);

-- Row Level Security
alter table artworks enable row level security;
alter table print_options enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies: Artworks are publicly readable
create policy "Artworks are viewable by everyone" on artworks
  for select using (true);

-- Policies: Print options are publicly readable
create policy "Print options are viewable by everyone" on print_options
  for select using (true);

-- Policies: Orders are only viewable by authenticated users (admin)
create policy "Orders viewable by admin" on orders
  for select using (auth.role() = 'authenticated');

create policy "Orders insertable by anyone" on orders
  for insert with check (true);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_artworks_updated_at
  before update on artworks
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

-- Sample data
insert into artworks (title, description, artist_name, image_url, price_base, featured, tags) values
  ('Sunset Over Mountains', 'A breathtaking view of the sun setting behind mountain peaks.', 'Artist Name', '/images/sunset-mountains.jpg', 29.99, true, '{"landscape", "sunset", "mountains"}'),
  ('Abstract Dreams', 'Bold colors and shapes that evoke a sense of wonder.', 'Artist Name', '/images/abstract-dreams.jpg', 34.99, true, '{"abstract", "colorful"}'),
  ('Ocean Waves', 'The power and beauty of the ocean captured on canvas.', 'Artist Name', '/images/ocean-waves.jpg', 39.99, true, '{"seascape", "ocean", "waves"}');
