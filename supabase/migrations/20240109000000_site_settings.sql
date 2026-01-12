-- Create site_settings table for storing design configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default design settings
INSERT INTO site_settings (id, settings) VALUES ('design', '{
  "primaryColor": "#d4846a",
  "secondaryColor": "#e8a87c",
  "accentColor": "#f5d4be",
  "backgroundColor": "#fff8f3",
  "textColor": "#1f2937",
  "headingFont": "serif",
  "bodyFont": "sans-serif",
  "texts": {}
}'::jsonb) ON CONFLICT (id) DO NOTHING;
