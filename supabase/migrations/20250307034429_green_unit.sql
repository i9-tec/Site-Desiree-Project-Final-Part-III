/*
  # Add site media table
  
  1. New Tables
    - `midias_site`
      - `id` (uuid, primary key)
      - `logotipo_img` (text, URL of the site logo)
      - `nome_site` (text, name of the site)
      - `principal_img_site` (text, URL of the main site image)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `midias_site` table
    - Add policy for public read access
    - Add policy for authenticated users to manage media
*/

CREATE TABLE IF NOT EXISTS midias_site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logotipo_img text NOT NULL,
  nome_site text NOT NULL,
  principal_img_site text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE midias_site ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public can view site media" 
  ON midias_site
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage site media" 
  ON midias_site
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_midias_site_updated_at
  BEFORE UPDATE ON midias_site
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default data
INSERT INTO midias_site (logotipo_img, nome_site, principal_img_site)
VALUES (
  'https://example.com/logo.png',
  'Desireé Lucchesi Imóveis',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2075&q=80'
);