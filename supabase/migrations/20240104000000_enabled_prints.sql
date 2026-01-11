-- Add enabled_prints column to artworks table
alter table artworks add column if not exists enabled_prints text[] default array[
  'poster-12x18', 'poster-18x24', 'poster-24x36',
  'canvas-12x16', 'canvas-18x24', 'canvas-24x36',
  'framed-12x18', 'framed-18x24', 'framed-24x36'
];
