
-- Tabela genérica de equipamentos por laboratório
CREATE TABLE public.laboratory_equipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laboratory_id uuid NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  brand text,
  model text,
  serial_number text,
  location text,
  responsible_person text,
  status text NOT NULL DEFAULT 'available',
  observations text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.laboratory_equipments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laboratory_equipments TO authenticated;
GRANT ALL ON public.laboratory_equipments TO service_role;

ALTER TABLE public.laboratory_equipments ENABLE ROW LEVEL SECURITY;

-- Leitura pública (listagem nas páginas de laboratórios)
CREATE POLICY "Public can view lab equipments"
ON public.laboratory_equipments
FOR SELECT
USING (true);

-- Apenas admins coordenacao/secretaria podem modificar
CREATE POLICY "Admins manage lab equipments insert"
ON public.laboratory_equipments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role IN ('coordenacao', 'secretaria')
  )
);

CREATE POLICY "Admins manage lab equipments update"
ON public.laboratory_equipments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role IN ('coordenacao', 'secretaria')
  )
);

CREATE POLICY "Admins manage lab equipments delete"
ON public.laboratory_equipments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND role IN ('coordenacao', 'secretaria')
  )
);

CREATE INDEX idx_laboratory_equipments_lab_id ON public.laboratory_equipments(laboratory_id);

CREATE TRIGGER update_laboratory_equipments_updated_at
BEFORE UPDATE ON public.laboratory_equipments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
