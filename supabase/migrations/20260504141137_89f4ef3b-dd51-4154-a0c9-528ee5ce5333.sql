-- Create public bucket for OS photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('os-photos', 'os-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (bucket is public, but we add a policy for clarity)
CREATE POLICY "OS photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'os-photos');

-- Authenticated staff can upload
CREATE POLICY "Staff can upload OS photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'os-photos' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'administrative'::app_role) OR
    has_role(auth.uid(), 'coordinator'::app_role) OR
    has_role(auth.uid(), 'technician'::app_role)
  )
);

-- Staff can delete OS photos
CREATE POLICY "Staff can delete OS photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'os-photos' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'administrative'::app_role) OR
    has_role(auth.uid(), 'coordinator'::app_role) OR
    has_role(auth.uid(), 'technician'::app_role)
  )
);

-- Staff can update OS photos
CREATE POLICY "Staff can update OS photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'os-photos' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'administrative'::app_role) OR
    has_role(auth.uid(), 'coordinator'::app_role) OR
    has_role(auth.uid(), 'technician'::app_role)
  )
);