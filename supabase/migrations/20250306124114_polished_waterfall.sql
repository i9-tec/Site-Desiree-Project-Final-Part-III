/*
  # Add developer table
  
  1. New Tables
    - `developer_i9`
      - `id` (uuid, primary key)
      - `logotipo` (text, URL of the logo)
      - `nome` (text, name of the developer)
      - `url` (text, website URL)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `developer_i9` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS developer_i9 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logotipo text NOT NULL,
  nome text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE developer_i9 ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Public can view developer info" 
  ON developer_i9
  FOR SELECT 
  TO public 
  USING (true);

-- Insert default data
INSERT INTO developer_i9 (logotipo, nome, url)
VALUES (
  'https://reidoslogotipos.com.br/blog/wp-content/uploads/2022/08/Slide1.png',
  'i9empreendendo',
  'https://i9empreendendo.com/'
);