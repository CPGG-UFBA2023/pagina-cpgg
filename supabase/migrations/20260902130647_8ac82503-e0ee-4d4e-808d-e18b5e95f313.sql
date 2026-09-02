DROP POLICY IF EXISTS "Only coordenacao can insert atas" ON public.atas;
DROP POLICY IF EXISTS "Only coordenacao can update atas" ON public.atas;
DROP POLICY IF EXISTS "Only coordenacao can delete atas" ON public.atas;

CREATE POLICY "Coordenacao and secretaria can insert atas"
ON public.atas
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
);

CREATE POLICY "Coordenacao and secretaria can update atas"
ON public.atas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
);

CREATE POLICY "Coordenacao and secretaria can delete atas"
ON public.atas
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
);

DROP POLICY IF EXISTS "Coordenacao can upload atas files" ON storage.objects;
DROP POLICY IF EXISTS "Coordenacao can delete atas files" ON storage.objects;

CREATE POLICY "Coordenacao and secretaria can upload atas files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'atas'
  AND EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
);

CREATE POLICY "Coordenacao and secretaria can delete atas files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'atas'
  AND EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
      AND admin_users.role IN ('coordenacao', 'secretaria')
  )
);