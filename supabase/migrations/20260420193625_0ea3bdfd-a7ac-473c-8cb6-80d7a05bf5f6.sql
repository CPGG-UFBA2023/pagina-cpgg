UPDATE public.history_documents
SET pdf_url = '/PDF_history.pdf', updated_at = now()
WHERE slug = 'cpgg-history';