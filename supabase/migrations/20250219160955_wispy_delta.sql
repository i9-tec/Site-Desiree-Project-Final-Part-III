/*
  # Featured Properties and Property Search Tables

  1. New Tables
    - `featured_properties`
      - `id` (uuid, primary key)
      - `position` (integer, required) - Order of display (1, 2, 3)
      - `property_id` (uuid, references properties)
      - `active` (boolean) - Whether this feature is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `property_search`
      - `id` (uuid, primary key)
      - `location` (text, required)
      - `property_type` (text, required)
      - `status` (text, required)
      - `price_range_min` (numeric)
      - `price_range_max` (numeric)
      - `bedrooms` (integer)
      - `suites` (integer)
      - `parking_spots` (integer)
      - `area_min` (numeric)
      - `area_max` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage featured properties
    - Add policies for public to view featured properties
    - Add policies for authenticated users to manage property search
    - Add policies for public to view property search
*/

-- Featured Properties Table
CREATE TABLE IF NOT EXISTS featured_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL CHECK (position >= 1 AND position <= 3),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a unique index for active positions
CREATE UNIQUE INDEX featured_properties_active_position
ON featured_properties (position)
WHERE active = true;

-- Property Search Table
CREATE TABLE IF NOT EXISTS property_search (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  property_type text NOT NULL,
  status text NOT NULL,
  price_range_min numeric,
  price_range_max numeric,
  bedrooms integer,
  suites integer,
  parking_spots integer,
  area_min numeric,
  area_max numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE featured_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_search ENABLE ROW LEVEL SECURITY;

-- Policies for featured_properties
CREATE POLICY "Public can view featured properties"
  ON featured_properties
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Authenticated users can manage featured properties"
  ON featured_properties
  USING (auth.role() = 'authenticated');

-- Policies for property_search
CREATE POLICY "Public can view property search"
  ON property_search
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage property search"
  ON property_search
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at
CREATE TRIGGER update_featured_properties_updated_at
  BEFORE UPDATE ON featured_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_search_updated_at
  BEFORE UPDATE ON property_search
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial featured properties positions
DO $$
BEGIN
  INSERT INTO featured_properties (position, active, property_id)
  SELECT 
    p.position,
    false,
    NULL
  FROM unnest(ARRAY[1, 2, 3]) AS p(position)
  ON CONFLICT DO NOTHING;
END;
$$;