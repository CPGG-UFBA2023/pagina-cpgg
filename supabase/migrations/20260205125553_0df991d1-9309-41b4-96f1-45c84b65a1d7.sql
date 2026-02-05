-- Criar bucket para armazenar os PDFs de TCC
INSERT INTO storage.buckets (id, name, public)
VALUES ('tcc-geofisica', 'tcc-geofisica', true);

-- Política para permitir leitura pública dos PDFs
CREATE POLICY "Allow public read access to tcc-geofisica"
ON storage.objects FOR SELECT
USING (bucket_id = 'tcc-geofisica');

-- Política para permitir upload apenas por coordenação
CREATE POLICY "Only coordenacao can upload to tcc-geofisica"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tcc-geofisica' 
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role = 'coordenacao'
  )
);

-- Política para permitir delete apenas por coordenação
CREATE POLICY "Only coordenacao can delete from tcc-geofisica"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tcc-geofisica' 
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role = 'coordenacao'
  )
);

-- Criar tabela para metadados dos TCCs
CREATE TABLE public.tcc_geofisica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tcc_geofisica ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Allow public read access to tcc_geofisica"
ON public.tcc_geofisica FOR SELECT
USING (true);

-- Apenas coordenação pode inserir
CREATE POLICY "Only coordenacao can insert tcc_geofisica"
ON public.tcc_geofisica FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role = 'coordenacao'
  )
);

-- Apenas coordenação pode atualizar
CREATE POLICY "Only coordenacao can update tcc_geofisica"
ON public.tcc_geofisica FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role = 'coordenacao'
  )
);

-- Apenas coordenação pode deletar
CREATE POLICY "Only coordenacao can delete tcc_geofisica"
ON public.tcc_geofisica FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role = 'coordenacao'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tcc_geofisica_updated_at
BEFORE UPDATE ON public.tcc_geofisica
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();