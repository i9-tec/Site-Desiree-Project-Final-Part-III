/*
  # Create contact form table

  1. New Tables
    - `contact_forms`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `message` (text, required)
      - `visit_date` (date, optional)
      - `visit_time` (time, optional)
      - `status` (text, default: 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `contact_forms` table
    - Add policy for public to create forms
    - Add policy for authenticated users to view forms
*/

CREATE TABLE IF NOT EXISTS contact_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  visit_date date,
  visit_time time,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can create contact forms"
  ON contact_forms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact forms"
  ON contact_forms
  FOR SELECT
  TO authenticated
  USING (true);