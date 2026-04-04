-- Add new columns to nav_settings for more flexible configuration
ALTER TABLE public.nav_settings 
ADD COLUMN IF NOT EXISTS logo_href TEXT DEFAULT '/',
ADD COLUMN IF NOT EXISTS scrolled_width TEXT DEFAULT '85%',
ADD COLUMN IF NOT EXISTS scrolled_mt TEXT DEFAULT '2',
ADD COLUMN IF NOT EXISTS scrolled_px TEXT DEFAULT '3',
ADD COLUMN IF NOT EXISTS scrolled_rounded TEXT DEFAULT '1.2rem',
ADD COLUMN IF NOT EXISTS scrolled_h TEXT DEFAULT '14',
ADD COLUMN IF NOT EXISTS default_h TEXT DEFAULT '16',
ADD COLUMN IF NOT EXISTS scrolled_bg_opacity TEXT DEFAULT '75',
ADD COLUMN IF NOT EXISTS scrolled_backdrop_blur TEXT DEFAULT 'md',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Update the public view to include the new columns
CREATE OR REPLACE VIEW public.nav_settings_public AS 
 SELECT id,
    logo_light_url,
    logo_dark_url,
    logo_href,
    scrolled_width,
    scrolled_mt,
    scrolled_px,
    scrolled_rounded,
    scrolled_h,
    default_h,
    scrolled_bg_opacity,
    scrolled_backdrop_blur,
    social_links
   FROM nav_settings
  LIMIT 1;
