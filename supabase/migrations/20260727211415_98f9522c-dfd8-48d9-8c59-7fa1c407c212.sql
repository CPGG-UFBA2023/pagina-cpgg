
-- Access list
CREATE TABLE public.laiga_repository_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laiga_repository_access TO authenticated;
GRANT ALL ON public.laiga_repository_access TO service_role;
ALTER TABLE public.laiga_repository_access ENABLE ROW LEVEL SECURITY;

-- Helper (security definer, avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_laiga_repo_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.laiga_repository_access WHERE user_id = auth.uid());
$$;

CREATE POLICY "repo_access_select" ON public.laiga_repository_access
  FOR SELECT TO authenticated USING (public.is_laiga_repo_user());
CREATE POLICY "repo_access_insert" ON public.laiga_repository_access
  FOR INSERT TO authenticated WITH CHECK (public.is_laiga_repo_user());
CREATE POLICY "repo_access_delete" ON public.laiga_repository_access
  FOR DELETE TO authenticated USING (public.is_laiga_repo_user());

-- Folders
CREATE TABLE public.laiga_repository_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laiga_repository_folders TO authenticated;
GRANT ALL ON public.laiga_repository_folders TO service_role;
ALTER TABLE public.laiga_repository_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repo_folders_all" ON public.laiga_repository_folders
  FOR ALL TO authenticated
  USING (public.is_laiga_repo_user())
  WITH CHECK (public.is_laiga_repo_user());

CREATE TRIGGER trg_repo_folders_updated
  BEFORE UPDATE ON public.laiga_repository_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Items
CREATE TABLE public.laiga_repository_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.laiga_repository_folders(id) ON DELETE CASCADE,
  professor_name text NOT NULL,
  checkout_date date NOT NULL,
  returned_at date,
  photo_urls text[] NOT NULL DEFAULT '{}',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laiga_repository_items TO authenticated;
GRANT ALL ON public.laiga_repository_items TO service_role;
ALTER TABLE public.laiga_repository_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "repo_items_all" ON public.laiga_repository_items
  FOR ALL TO authenticated
  USING (public.is_laiga_repo_user())
  WITH CHECK (public.is_laiga_repo_user());

CREATE TRIGGER trg_repo_items_updated
  BEFORE UPDATE ON public.laiga_repository_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_repo_items_folder ON public.laiga_repository_items(folder_id);

-- Storage policies for bucket 'laiga-repository'
CREATE POLICY "laiga_repo_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'laiga-repository' AND public.is_laiga_repo_user());
CREATE POLICY "laiga_repo_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'laiga-repository' AND public.is_laiga_repo_user());
CREATE POLICY "laiga_repo_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'laiga-repository' AND public.is_laiga_repo_user());
CREATE POLICY "laiga_repo_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'laiga-repository' AND public.is_laiga_repo_user());

-- Seed Marcos Vasconcelos
INSERT INTO public.laiga_repository_access (user_id, full_name, role)
VALUES ('8d10738d-c82a-4edf-ab42-e3d98a935caa', 'Marcos Alberto Rodrigues Vasconcelos', 'coordinator')
ON CONFLICT (user_id) DO NOTHING;
