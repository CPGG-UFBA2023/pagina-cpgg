ALTER TABLE public.events
  ALTER COLUMN event_date DROP NOT NULL;

ALTER TABLE public.event_photos
  ADD COLUMN IF NOT EXISTS photo_date date;

COMMENT ON COLUMN public.events.event_date IS 'Optional date for the album or event';
COMMENT ON COLUMN public.event_photos.photo_date IS 'Optional date specific to this photo';