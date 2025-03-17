/*
  # Update Property Search Policies

  1. Changes
    - Add public access policy for property_search table
    - Allow anonymous users to insert search records
    - Maintain existing policies for authenticated users

  2. Security
    - Enable public access for search history
    - Maintain RLS for data protection
*/

-- Drop existing policies for property_search
DROP POLICY IF EXISTS "Public can view property search" ON property_search;
DROP POLICY IF EXISTS "Authenticated users can manage property search" ON property_search;

-- Create new policies
CREATE POLICY "Anyone can insert search records"
  ON property_search
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view search records"
  ON property_search
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage all search records"
  ON property_search
  USING (auth.role() = 'authenticated');