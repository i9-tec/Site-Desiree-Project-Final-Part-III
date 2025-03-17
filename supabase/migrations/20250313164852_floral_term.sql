/*
  # Update properties table for image handling

  1. Changes
    - Add check constraint to limit images array to 10 items
    - Add validation trigger to enforce image limit
*/

-- Drop existing constraint if it exists
DO $$ 
BEGIN
  ALTER TABLE properties DROP CONSTRAINT IF EXISTS max_images_check;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Add check constraint to limit images array size
ALTER TABLE properties
ADD CONSTRAINT max_images_check CHECK (array_length(images, 1) <= 10);

-- Create function to validate images array length
CREATE OR REPLACE FUNCTION validate_images_array()
RETURNS TRIGGER AS $$
BEGIN
  IF array_length(NEW.images, 1) > 10 THEN
    RAISE EXCEPTION 'Maximum of 10 images allowed per property';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_images_length ON properties;

-- Create trigger to validate images array before insert or update
CREATE TRIGGER validate_images_length
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION validate_images_array();