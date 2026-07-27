
-- Revoke EXECUTE across all SECURITY DEFINER helpers; then re-grant only what client actually needs
REVOKE EXECUTE ON FUNCTION public.auto_create_user_profile_for_researcher() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_generate_public_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_email_confirmation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_profile_duplicates(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.find_user_profile_by_name(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_user_keep_profile_data(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_role() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_laiga_repo_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.list_all_user_profiles() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_researcher_as_chief(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_complete(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_profile(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_user_profile(uuid, uuid, text, text, text, text, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_auth_users_to_profiles() FROM authenticated;

-- Re-grant the minimum set the client actually calls via .rpc()
-- Sign/Registration pages call these while unauthenticated:
GRANT EXECUTE ON FUNCTION public.find_user_profile_by_name(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_profile_duplicates(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_keep_profile_data(uuid) TO anon, authenticated;
-- Authenticated admin-only RPCs (each function does its own admin check):
GRANT EXECUTE ON FUNCTION public.list_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_auth_users_to_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_complete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_user_profile(uuid, uuid, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_researcher_as_chief(uuid, text) TO authenticated;

-- Add admin checks to functions that previously lacked them
CREATE OR REPLACE FUNCTION public.delete_user_profile(_profile_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _admin_role text;
BEGIN
  SELECT role INTO _admin_role FROM admin_users WHERE user_id = auth.uid();
  IF _admin_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  DELETE FROM user_profiles WHERE id = _profile_id;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_user_keep_profile_data(_user_profile_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid; _full_name text; _description text; _photo_url text;
BEGIN
  -- Only admins may reset another user's account
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  SELECT user_id, full_name, description, photo_url
    INTO _user_id, _full_name, _description, _photo_url
    FROM public.user_profiles WHERE id = _user_profile_id;
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Profile has no user_id');
  END IF;
  UPDATE public.user_profiles
    SET user_id = NULL, email = 'email.provisorio@aguardando.cadastro',
        phone = '(00) 00000-0000', updated_at = now()
    WHERE id = _user_profile_id;
  DELETE FROM auth.users WHERE id = _user_id;
  RETURN jsonb_build_object('success', true, 'user_name', _full_name);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Tighten remaining always-true policies with basic sanity checks
DROP POLICY IF EXISTS "Allow public insert access to visitor_locations" ON public.visitor_locations;
CREATE POLICY "Allow public insert access to visitor_locations" ON public.visitor_locations
  FOR INSERT TO anon, authenticated
  WITH CHECK (city IS NOT NULL AND country IS NOT NULL AND visitor_count >= 0);

DROP POLICY IF EXISTS "Allow public update access to visitor_locations" ON public.visitor_locations;
CREATE POLICY "Allow public update access to visitor_locations" ON public.visitor_locations
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (visitor_count >= 0);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.reservations;
CREATE POLICY "Enable insert access for all users" ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (nome <> '' AND email <> '' AND inicio < termino);

DROP POLICY IF EXISTS "Anyone can insert repair requests" ON public.repair_requests;
CREATE POLICY "Anyone can insert repair requests" ON public.repair_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (nome <> '' AND email <> '' AND problem_description <> '');
