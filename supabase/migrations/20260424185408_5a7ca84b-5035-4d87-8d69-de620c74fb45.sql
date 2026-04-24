-- Add archive_number column for sequential numbering of news articles
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS archive_number integer;

-- Create a sequence for archive numbers
CREATE SEQUENCE IF NOT EXISTS public.news_archive_number_seq START 1;

-- Backfill existing news with sequential numbers based on creation date
DO $$
DECLARE
  rec RECORD;
  counter integer := 1;
BEGIN
  -- Reset sequence
  PERFORM setval('public.news_archive_number_seq', 1, false);
  
  FOR rec IN SELECT id FROM public.news WHERE archive_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.news SET archive_number = counter WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
  
  -- Set sequence to next value
  PERFORM setval('public.news_archive_number_seq', GREATEST(counter, 1), false);
END $$;

-- Make column NOT NULL with default from sequence
ALTER TABLE public.news ALTER COLUMN archive_number SET DEFAULT nextval('public.news_archive_number_seq');
ALTER TABLE public.news ALTER COLUMN archive_number SET NOT NULL;

-- Add unique constraint
ALTER TABLE public.news ADD CONSTRAINT news_archive_number_unique UNIQUE (archive_number);

-- Trigger to auto-assign archive_number on insert if not provided
CREATE OR REPLACE FUNCTION public.assign_news_archive_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.archive_number IS NULL THEN
    NEW.archive_number := nextval('public.news_archive_number_seq');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_news_archive_number ON public.news;
CREATE TRIGGER trg_assign_news_archive_number
BEFORE INSERT ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.assign_news_archive_number();