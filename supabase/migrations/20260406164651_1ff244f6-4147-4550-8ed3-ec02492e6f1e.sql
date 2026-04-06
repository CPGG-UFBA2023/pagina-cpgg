
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf1_url text DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf1_title text DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf2_url text DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf2_title text DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf3_url text DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS pdf3_title text DEFAULT NULL;

UPDATE public.news SET pdf1_url = pdf_url, pdf1_title = 'Documento anexo' WHERE pdf_url IS NOT NULL;

ALTER TABLE public.news DROP COLUMN IF EXISTS pdf_url;
