/*
  # Create About Me table

  1. New Tables
    - `about_me`
      - `id` (uuid, primary key)
      - `profile_image` (text, URL for profile image)
      - `my_story` (text, content for "Minha história" section)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `about_me` table
    - Add policy for public to view data
    - Add policy for authenticated users to manage data
*/

CREATE TABLE IF NOT EXISTS about_me (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image text NOT NULL,
  my_story text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE about_me ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view about_me"
  ON about_me
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage about_me"
  ON about_me
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_about_me_updated_at
  BEFORE UPDATE ON about_me
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert initial data
INSERT INTO about_me (profile_image, my_story)
VALUES (
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
  'Com mais de 15 anos de experiência no mercado imobiliário de alto padrão, construí minha carreira com base na confiança e no atendimento personalizado. Minha paixão por imóveis começou cedo, quando acompanhava meu pai, também corretor, em suas visitas a empreendimentos.

Hoje, sou especialista em imóveis de luxo e lançamentos exclusivos, com foco em proporcionar uma experiência única para cada cliente, entendendo suas necessidades e encontrando o imóvel perfeito para realizar seus sonhos.'
)
ON CONFLICT DO NOTHING;