DROP POLICY IF EXISTS "Coordenacao can update laboratory photos" ON storage.objects;
DROP POLICY IF EXISTS "Coordenacao can upload laboratory photos" ON storage.objects;
DROP POLICY IF EXISTS "Coordenacao can delete laboratory photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read laboratory photos" ON storage.objects;

CREATE POLICY "Public can read laboratory photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'laboratory-photos');

CREATE POLICY "Staff can upload laboratory photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'laboratory-photos');

CREATE POLICY "Staff can update laboratory photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'laboratory-photos')
WITH CHECK (bucket_id = 'laboratory-photos');

CREATE POLICY "Staff can delete laboratory photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'laboratory-photos');