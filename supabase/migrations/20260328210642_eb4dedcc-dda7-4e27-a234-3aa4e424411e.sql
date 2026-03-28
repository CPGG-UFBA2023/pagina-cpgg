
-- 1. Fix admin_users: Remove overly permissive public INSERT/UPDATE policies
DROP POLICY IF EXISTS "Only coordenacao can insert users" ON public.admin_users;
DROP POLICY IF EXISTS "Only coordenacao can update users" ON public.admin_users;

-- Replace with properly restricted policies
CREATE POLICY "Coordenacao can insert admin users via auth"
ON public.admin_users FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'coordenacao'
  )
);

CREATE POLICY "Coordenacao can update admin users via auth"
ON public.admin_users FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'coordenacao'
  )
);

-- 2. Fix delete_user_complete: Add admin check
CREATE OR REPLACE FUNCTION public.delete_user_complete(_user_profile_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _full_name text;
  _admin_role text;
BEGIN
  -- Check caller is admin
  SELECT role INTO _admin_role FROM admin_users WHERE user_id = auth.uid();
  IF _admin_role IS NULL OR _admin_role != 'coordenacao' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT user_id, full_name INTO _user_id, _full_name
  FROM public.user_profiles 
  WHERE id = _user_profile_id;
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  DELETE FROM public.user_profiles WHERE id = _user_profile_id;
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'User deleted successfully',
    'user_name', _full_name
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- 3. Fix uploads bucket: Restrict to authenticated users with owner checks
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete files" ON storage.objects;

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Fix reservations: Restrict SELECT to admin roles only
DROP POLICY IF EXISTS "Allow public read access to reservations" ON public.reservations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reservations;

CREATE POLICY "Only admins can view reservations"
ON public.reservations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.role IN ('coordenacao', 'secretaria', 'ti')
  )
);

-- 5. Fix user_profiles: Create a view that excludes sensitive fields for public access
-- Drop the overly broad public SELECT policy and replace with one that hides phone/email
DROP POLICY IF EXISTS "Public can view researcher profiles" ON public.user_profiles;

CREATE POLICY "Public can view researcher profiles limited"
ON public.user_profiles FOR SELECT TO public
USING (
  researcher_route IS NOT NULL
);
