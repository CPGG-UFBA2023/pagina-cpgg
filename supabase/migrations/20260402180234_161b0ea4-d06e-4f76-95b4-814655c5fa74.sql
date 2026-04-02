INSERT INTO storage.buckets (id, name, public) VALUES ('atas', 'atas', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read atas files" ON storage.objects FOR SELECT USING (bucket_id = 'atas');

CREATE POLICY "Coordenacao can upload atas files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'atas' AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao'
  )
);

CREATE POLICY "Coordenacao can delete atas files" ON storage.objects FOR DELETE USING (
  bucket_id = 'atas' AND EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao'
  )
);