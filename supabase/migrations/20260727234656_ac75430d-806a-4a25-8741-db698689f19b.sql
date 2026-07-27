
CREATE OR REPLACE FUNCTION public.is_laiga_repo_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT
      auth.uid() AS uid,
      (SELECT lower(email) FROM auth.users WHERE id = auth.uid()) AS email,
      (SELECT lower(full_name) FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) AS full_name,
      (SELECT id FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) AS profile_id
  )
  SELECT
    EXISTS (SELECT 1 FROM public.laiga_repository_access a, me WHERE a.user_id = me.uid)
    OR EXISTS (
      SELECT 1 FROM public.laboratories l, me
      WHERE l.chief_user_id = me.uid
         OR l.chief_user_id = me.profile_id
         OR (me.email IS NOT NULL AND lower(l.chief_alternative_email) = me.email)
         OR (me.full_name IS NOT NULL AND lower(l.chief_name) = me.full_name)
         OR (me.full_name IS NOT NULL AND lower(l.technician_name) = me.full_name)
    )
    OR EXISTS (
      SELECT 1 FROM public.technician_profiles tp, me
      WHERE tp.user_id = me.uid
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_laiga_repo_user() TO authenticated;
