CREATE OR REPLACE FUNCTION public.is_laiga_repo_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.laiga_repository_access WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.laboratories WHERE chief_user_id = auth.uid());
$$;