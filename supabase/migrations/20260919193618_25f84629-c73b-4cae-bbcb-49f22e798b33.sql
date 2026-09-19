ALTER TABLE public.events ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.events(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS events_parent_id_idx ON public.events(parent_id);