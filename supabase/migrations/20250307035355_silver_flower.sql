/*
  # Add privacy and terms table
  
  1. New Tables
    - `politicas_termos`
      - `id` (uuid, primary key)
      - `politicas_priv_cookies` (text, URL for privacy policy)
      - `termos_condicoes` (text, URL for terms of use)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `politicas_termos` table
    - Add policy for public read access
    - Add policy for authenticated users to manage content
*/

CREATE TABLE IF NOT EXISTS politicas_termos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politicas_priv_cookies text NOT NULL,
  termos_condicoes text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE politicas_termos ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public can view privacy and terms" 
  ON politicas_termos
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage privacy and terms" 
  ON politicas_termos
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_politicas_termos_updated_at
  BEFORE UPDATE ON politicas_termos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default data
INSERT INTO politicas_termos (politicas_priv_cookies, termos_condicoes)
VALUES (
  'https://dlucchesi.com.br/',
  'https://dlucchesi.com.br/'
);