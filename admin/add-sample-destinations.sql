-- Add sample destinations for testing
-- Run this in your Supabase SQL editor

-- First, disable RLS to ensure we can insert data
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

-- Insert sample destinations with basic columns only
INSERT INTO destinations (name, description, location, category, is_active, featured) VALUES
(
  'Temple of Leah',
  'A beautiful Roman-inspired temple built as a symbol of undying love. The temple offers stunning views of Cebu City and houses a collection of art and antiques.',
  'Busay, Cebu City',
  'Cultural Sites',
  true,
  true
),
(
  'Kawasan Falls',
  'A stunning multi-tiered waterfall perfect for swimming and canyoneering adventures. The turquoise blue waters and lush surroundings make it a must-visit destination.',
  'Badian, Cebu',
  'Natural Attractions',
  true,
  true
),
(
  'Magellan''s Cross',
  'Historical landmark marking the spot where Ferdinand Magellan planted the cross that introduced Christianity to the Philippines in 1521.',
  'Cebu City',
  'Historical Sites',
  true,
  false
),
(
  'Basilica del Santo Niño',
  'The oldest Roman Catholic church in the Philippines, home to the revered image of the Santo Niño (Child Jesus).',
  'Cebu City',
  'Churches',
  true,
  false
),
(
  'Sirao Flower Garden',
  'A colorful flower garden featuring celosia flowers in vibrant colors, offering beautiful views and photo opportunities.',
  'Sirao, Cebu City',
  'Gardens',
  true,
  false
)
ON CONFLICT (name) DO NOTHING;
