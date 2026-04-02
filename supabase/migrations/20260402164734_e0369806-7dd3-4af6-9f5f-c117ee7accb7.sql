
CREATE TABLE public.atas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_date DATE NOT NULL,
  meeting_type TEXT NOT NULL,
  year_group TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to atas" ON public.atas FOR SELECT TO public USING (true);
CREATE POLICY "Only coordenacao can insert atas" ON public.atas FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role = 'coordenacao'));
CREATE POLICY "Only coordenacao can update atas" ON public.atas FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role = 'coordenacao'));
CREATE POLICY "Only coordenacao can delete atas" ON public.atas FOR DELETE TO public USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role = 'coordenacao'));
