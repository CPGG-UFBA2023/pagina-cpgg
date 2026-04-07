
CREATE TABLE public.senior_researchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  researcher_id uuid REFERENCES public.researchers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.senior_researchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to senior_researchers" ON public.senior_researchers FOR SELECT TO public USING (true);
CREATE POLICY "Only coordenacao can insert senior_researchers" ON public.senior_researchers FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role IN ('coordenacao', 'secretaria')));
CREATE POLICY "Only coordenacao can update senior_researchers" ON public.senior_researchers FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role IN ('coordenacao', 'secretaria')));
CREATE POLICY "Only coordenacao can delete senior_researchers" ON public.senior_researchers FOR DELETE TO public USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role IN ('coordenacao', 'secretaria')));

-- Seed with current data
INSERT INTO public.senior_researchers (name, researcher_id) VALUES
  ('Aroldo Misi', '0bb0394a-e96e-4af7-a69f-fe81a41ebbaa'),
  ('Edson Emanuel Starteri Sampaio', '2b1a5a7f-8910-44e1-b88d-f5feee7a4195'),
  ('Johildo Salomão Figuerêdo Barbosa', '32d973bf-215e-4145-9759-31685cee7e7a'),
  ('José Maria Dominguez Landim', '5f2752aa-b103-48ab-8b7a-89e358795b09'),
  ('Juarez dos Santos Azevedo', 'e288b7c5-ffb1-404b-a952-783cc2fb0967'),
  ('Luiz Rogério Bastos Leal', 'c60ebb49-68d6-4c89-8d16-5ce402f0cd91'),
  ('Marcos Alberto Rodrigues Vasconcelos', '76be24ad-b44c-48dc-8cbd-9f96362678e7'),
  ('Milton José Porsani', '676bc98a-459e-48bc-ab81-aa0a9c48f411'),
  ('Reynam da Cruz Pestana', '0b968483-40e2-44c8-90b9-878888760a77'),
  ('Ruy Kenji Papa de Kikuchi', 'a403df12-741d-41da-aa2d-60d7b654e1cd'),
  ('Simone Cerqueira Pereira Cruz', 'b66d8460-d4af-4db6-a1b9-c1b91b6e098a');
