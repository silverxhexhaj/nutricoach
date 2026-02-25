-- Create coach-logos storage bucket (public so logo URLs work without signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-logos', 'coach-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos to their own folder (user_id/...)
CREATE POLICY "Coaches can upload their logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coach-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow overwriting (upsert) - users can update their own files
CREATE POLICY "Coaches can update their logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'coach-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'coach-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow SELECT for public read (bucket is public, but policy may still be needed)
CREATE POLICY "Public read for coach logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'coach-logos');
