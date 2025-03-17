/*
  # Property Search Improvements

  1. Changes
    - Add region and city columns to properties table
    - Add property_count column to track number of properties per location
    - Add display_status column for customizable status labels

  2. Updates
    - Add indexes for improved search performance
    - Add functions to update property counts
*/

-- Add new columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS display_status text;

-- Update existing records to use display_status
UPDATE properties
SET display_status = CASE 
  WHEN status = 'launch' THEN 'Lançamento'
  WHEN status = 'new' THEN 'Novo'
  WHEN status = 'used' THEN 'Usado'
  ELSE status
END
WHERE display_status IS NULL;

-- Create location_stats table
CREATE TABLE IF NOT EXISTS location_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  city text,
  region text,
  property_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location, city, region)
);

-- Enable RLS
ALTER TABLE location_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view location stats" ON location_stats;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Public can view location stats"
  ON location_stats
  FOR SELECT
  TO public
  USING (true);

-- Create function to update location stats
CREATE OR REPLACE FUNCTION update_location_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert stats for the location
  INSERT INTO location_stats (location, city, region, property_count)
  VALUES (
    NEW.location,
    NEW.city,
    NEW.region,
    1
  )
  ON CONFLICT (location, city, region)
  DO UPDATE SET 
    property_count = (
      SELECT COUNT(*)
      FROM properties
      WHERE location = NEW.location
      AND city = NEW.city
      AND region = NEW.region
    ),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_property_location_stats ON properties;

-- Create trigger for location stats
CREATE TRIGGER update_property_location_stats
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_location_stats();

-- Create indexes for improved search performance
DROP INDEX IF EXISTS idx_properties_location;
DROP INDEX IF EXISTS idx_properties_city;
DROP INDEX IF EXISTS idx_properties_region;

CREATE INDEX idx_properties_location ON properties (location);
CREATE INDEX idx_properties_city ON properties (city);
CREATE INDEX idx_properties_region ON properties (region);