ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS display_date boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS events_category_event_date_idx
  ON public.events (category, event_date DESC);

COMMENT ON COLUMN public.events.category IS 'Album group: event or historical';
COMMENT ON COLUMN public.events.display_date IS 'Whether the album date is shown publicly';