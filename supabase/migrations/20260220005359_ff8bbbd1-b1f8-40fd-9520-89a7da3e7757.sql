
-- Add card_image_url column to feature_requests
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS card_image_url text;

-- Create vote-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vote-images', 'vote-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vote-images bucket
CREATE POLICY "Public can view vote images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vote-images');

CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vote-images' AND public.is_admin());

CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vote-images' AND public.is_admin());

CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vote-images' AND public.is_admin());
