/*
  # Create analytics and tracking tables

  1. New Tables
    - `google_analytics_4`
      - `id` (uuid, primary key)
      - `script` (text) - GA4 tracking script
      - `pixel_id` (text) - GA4 measurement ID
      - `observations` (text) - Additional notes
      
    - `google_ads`
      - `id` (uuid, primary key)
      - `script` (text) - Google Ads tracking script
      - `pixel_id` (text) - Google Ads conversion ID
      - `observations` (text) - Additional notes
      
    - `facebook_instagram`
      - `id` (uuid, primary key)
      - `script` (text) - Facebook Pixel script
      - `pixel_id` (text) - Facebook Pixel ID
      - `observations` (text) - Additional notes
      
    - `bing_microsoft_ads`
      - `id` (uuid, primary key)
      - `script` (text) - Bing UET tag script
      - `pixel_id` (text) - Bing UET tag ID
      - `observations` (text) - Additional notes
      
    - `linkedin`
      - `id` (uuid, primary key)
      - `script` (text) - LinkedIn Insight Tag script
      - `pixel_id` (text) - LinkedIn Partner ID
      - `observations` (text) - Additional notes
      
    - `google_gtm`
      - `id` (uuid, primary key)
      - `script` (text) - GTM script
      - `pixel_id` (text) - GTM container ID
      - `observations` (text) - Additional notes
      
    - `cookie_tracking`
      - `id` (uuid, primary key)
      - `script` (text) - Cookie consent script
      - `code` (text) - HTML/configuration code
      - `observations` (text) - Additional notes
      
    - `universal_codes`
      - `id` (uuid, primary key)
      - `script` (text) - Script/code to be included
      - `code` (text) - HTML/configuration code
      - `other_languages` (text) - Code in other languages
      - `observations` (text) - Additional notes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage tracking codes
    - Add policies for public to view tracking codes
*/

-- Google Analytics 4 Table
CREATE TABLE IF NOT EXISTS google_analytics_4 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_analytics_4 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage GA4 settings"
  ON google_analytics_4
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view GA4 settings"
  ON google_analytics_4
  FOR SELECT
  TO public
  USING (true);

-- Google Ads Table
CREATE TABLE IF NOT EXISTS google_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage Google Ads settings"
  ON google_ads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view Google Ads settings"
  ON google_ads
  FOR SELECT
  TO public
  USING (true);

-- Facebook/Instagram Table
CREATE TABLE IF NOT EXISTS facebook_instagram (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facebook_instagram ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage Facebook/Instagram settings"
  ON facebook_instagram
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view Facebook/Instagram settings"
  ON facebook_instagram
  FOR SELECT
  TO public
  USING (true);

-- Bing/Microsoft Ads Table
CREATE TABLE IF NOT EXISTS bing_microsoft_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bing_microsoft_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage Bing/Microsoft Ads settings"
  ON bing_microsoft_ads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view Bing/Microsoft Ads settings"
  ON bing_microsoft_ads
  FOR SELECT
  TO public
  USING (true);

-- LinkedIn Table
CREATE TABLE IF NOT EXISTS linkedin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE linkedin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage LinkedIn settings"
  ON linkedin
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view LinkedIn settings"
  ON linkedin
  FOR SELECT
  TO public
  USING (true);

-- Google Tag Manager Table
CREATE TABLE IF NOT EXISTS google_gtm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  pixel_id text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE google_gtm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage GTM settings"
  ON google_gtm
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view GTM settings"
  ON google_gtm
  FOR SELECT
  TO public
  USING (true);

-- Cookie Tracking Table
CREATE TABLE IF NOT EXISTS cookie_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  code text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cookie_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage cookie tracking settings"
  ON cookie_tracking
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view cookie tracking settings"
  ON cookie_tracking
  FOR SELECT
  TO public
  USING (true);

-- Universal Codes Table
CREATE TABLE IF NOT EXISTS universal_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script text,
  code text,
  other_languages text,
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE universal_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage universal codes"
  ON universal_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view universal codes"
  ON universal_codes
  FOR SELECT
  TO public
  USING (true);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_analytics_4_updated_at
  BEFORE UPDATE ON google_analytics_4
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_updated_at
  BEFORE UPDATE ON google_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_instagram_updated_at
  BEFORE UPDATE ON facebook_instagram
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bing_microsoft_ads_updated_at
  BEFORE UPDATE ON bing_microsoft_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_updated_at
  BEFORE UPDATE ON linkedin
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_gtm_updated_at
  BEFORE UPDATE ON google_gtm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cookie_tracking_updated_at
  BEFORE UPDATE ON cookie_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universal_codes_updated_at
  BEFORE UPDATE ON universal_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();