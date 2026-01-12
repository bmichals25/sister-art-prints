-- Add custom_products column to store custom product types (water bottles, shirts, etc.)
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS custom_products JSONB DEFAULT '[]'::jsonb;

-- Add custom_prices column to store custom prices per print option
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS custom_prices JSONB DEFAULT '{}'::jsonb;
