create extension if not exists "uuid-ossp";

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

create table if not exists store_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text default 'KatiaPrints',
  tagline text default 'Original artwork, beautifully printed',
  primary_color text default '#2d2a26',
  secondary_color text default '#fff8f3',
  accent_color text default '#e8a87c',
  font_heading text default 'Playfair Display',
  font_body text default 'Inter',
  vibe text default 'minimal',
  hero_title text default 'Original Art, Beautiful Prints',
  hero_subtitle text default 'Discover our curated collection of original artwork, available as museum-quality prints delivered to your door.',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table artworks enable row level security;
alter table store_settings enable row level security;

create policy "Artworks are viewable by everyone" on artworks for select using (true);
create policy "Authenticated users can insert artworks" on artworks for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update artworks" on artworks for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete artworks" on artworks for delete using (auth.role() = 'authenticated');

create policy "Store settings are viewable by everyone" on store_settings for select using (true);
create policy "Authenticated users can update store settings" on store_settings for update using (auth.role() = 'authenticated');
create policy "Authenticated users can insert store settings" on store_settings for insert with check (auth.role() = 'authenticated');

insert into store_settings (id) values (uuid_generate_v4()) on conflict do nothing;
