
-- Create bucket for history PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('history-pdf', 'history-pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin (coordenacao) write
CREATE POLICY "History PDF public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'history-pdf');

CREATE POLICY "History PDF admin insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'history-pdf'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao')
);

CREATE POLICY "History PDF admin update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'history-pdf'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao')
);

CREATE POLICY "History PDF admin delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'history-pdf'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao')
);

-- Table to store the active history PDF URL (single row managed)
CREATE TABLE public.history_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.history_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "History documents public read"
ON public.history_documents FOR SELECT
USING (true);

CREATE POLICY "History documents admin insert"
ON public.history_documents FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao'));

CREATE POLICY "History documents admin update"
ON public.history_documents FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao'));

CREATE POLICY "History documents admin delete"
ON public.history_documents FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'coordenacao'));

CREATE TRIGGER update_history_documents_updated_at
BEFORE UPDATE ON public.history_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the cpgg-history slug with the legacy URL (will be replaced by upload)
INSERT INTO public.history_documents (slug, title, pdf_url)
VALUES ('cpgg-history', 'História do CPGG', 'https://raw.githubusercontent.com/CPGG-UFBA/Documentos_WEB_CPGG/main/PDF_history.pdf');
