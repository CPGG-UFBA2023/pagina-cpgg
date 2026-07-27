
-- =========================================================
-- 1) Fix admin-only RLS policies that had qual=true
-- =========================================================

-- events
DROP POLICY IF EXISTS "Only coordenacao can delete events" ON public.events;
DROP POLICY IF EXISTS "Only coordenacao can insert events" ON public.events;
DROP POLICY IF EXISTS "Only coordenacao can update events" ON public.events;
CREATE POLICY "Only coordenacao can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- event_photos
DROP POLICY IF EXISTS "Only coordenacao can delete event_photos" ON public.event_photos;
DROP POLICY IF EXISTS "Only coordenacao can insert event_photos" ON public.event_photos;
DROP POLICY IF EXISTS "Only coordenacao can update event_photos" ON public.event_photos;
CREATE POLICY "Only coordenacao can delete event_photos" ON public.event_photos FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert event_photos" ON public.event_photos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update event_photos" ON public.event_photos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- laboratories
DROP POLICY IF EXISTS "Only coordenacao can delete laboratories" ON public.laboratories;
DROP POLICY IF EXISTS "Only coordenacao can insert laboratories" ON public.laboratories;
DROP POLICY IF EXISTS "Only coordenacao can update laboratories" ON public.laboratories;
CREATE POLICY "Only coordenacao can delete laboratories" ON public.laboratories FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert laboratories" ON public.laboratories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update laboratories" ON public.laboratories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- laiga_equipment
DROP POLICY IF EXISTS "Authenticated users can delete equipment" ON public.laiga_equipment;
DROP POLICY IF EXISTS "Authenticated users can insert equipment" ON public.laiga_equipment;
DROP POLICY IF EXISTS "Authenticated users can update equipment" ON public.laiga_equipment;
CREATE POLICY "Admins can delete equipment" ON public.laiga_equipment FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert equipment" ON public.laiga_equipment FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update equipment" ON public.laiga_equipment FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- laiga_equipments
DROP POLICY IF EXISTS "Only coordenacao can delete laiga_equipments" ON public.laiga_equipments;
DROP POLICY IF EXISTS "Only coordenacao can insert laiga_equipments" ON public.laiga_equipments;
DROP POLICY IF EXISTS "Only coordenacao can update laiga_equipments" ON public.laiga_equipments;
CREATE POLICY "Only coordenacao can delete laiga_equipments" ON public.laiga_equipments FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert laiga_equipments" ON public.laiga_equipments FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update laiga_equipments" ON public.laiga_equipments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- news
DROP POLICY IF EXISTS "Only coordenacao can delete news" ON public.news;
DROP POLICY IF EXISTS "Only coordenacao can insert news" ON public.news;
DROP POLICY IF EXISTS "Only coordenacao can update news" ON public.news;
CREATE POLICY "Only coordenacao can delete news" ON public.news FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert news" ON public.news FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update news" ON public.news FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- regulations
DROP POLICY IF EXISTS "Only coordenacao can delete regulations" ON public.regulations;
DROP POLICY IF EXISTS "Only coordenacao can insert regulations" ON public.regulations;
DROP POLICY IF EXISTS "Only coordenacao can update regulations" ON public.regulations;
CREATE POLICY "Only coordenacao can delete regulations" ON public.regulations FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert regulations" ON public.regulations FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update regulations" ON public.regulations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- research_projects
DROP POLICY IF EXISTS "Only coordenacao can delete research_projects" ON public.research_projects;
DROP POLICY IF EXISTS "Only coordenacao can insert research_projects" ON public.research_projects;
DROP POLICY IF EXISTS "Only coordenacao can update research_projects" ON public.research_projects;
CREATE POLICY "Only coordenacao can delete research_projects" ON public.research_projects FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert research_projects" ON public.research_projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update research_projects" ON public.research_projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- researchers
DROP POLICY IF EXISTS "Only coordenacao can insert researchers" ON public.researchers;
DROP POLICY IF EXISTS "Only coordenacao can update researchers" ON public.researchers;
CREATE POLICY "Only coordenacao can insert researchers" ON public.researchers FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update researchers" ON public.researchers FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- reservations (admin update/delete; insert is intentionally public for the reservation form)
DROP POLICY IF EXISTS "Only coordenacao can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Only coordenacao can update reservations" ON public.reservations;
CREATE POLICY "Only coordenacao can delete reservations" ON public.reservations FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can update reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scientific_publications
DROP POLICY IF EXISTS "Only coordenacao can delete scientific_publications" ON public.scientific_publications;
DROP POLICY IF EXISTS "Only coordenacao can insert scientific_publications" ON public.scientific_publications;
DROP POLICY IF EXISTS "Only coordenacao can update scientific_publications" ON public.scientific_publications;
CREATE POLICY "Only coordenacao can delete scientific_publications" ON public.scientific_publications FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Only coordenacao can insert scientific_publications" ON public.scientific_publications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only coordenacao can update scientific_publications" ON public.scientific_publications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================
-- 2) Restrict EXECUTE on SECURITY DEFINER functions
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.check_user_profile_duplicates(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_admin_from_panel(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_admin_user(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_complete(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_profile(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_user_profile_by_name(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_public_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_laiga_repo_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_all_user_profiles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_user_keep_profile_data(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.restore_user_profile(uuid, uuid, text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_researcher_as_chief(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sync_auth_users_to_profiles() FROM PUBLIC, anon;

-- Add admin gating inside functions that previously lacked it
CREATE OR REPLACE FUNCTION public.list_all_user_profiles()
 RETURNS TABLE(id uuid, full_name text, email text, institution text, phone text, user_id uuid, researcher_route text, public_id text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
    SELECT up.id, up.full_name, up.email, up.institution, up.phone, up.user_id, up.researcher_route, up.public_id
    FROM public.user_profiles up
    ORDER BY lower(up.full_name) ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_auth_users_to_profiles()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  auth_user RECORD;
  inserted_count INTEGER := 0;
  updated_count INTEGER := 0;
  v_full_name text;
  v_institution text;
  v_phone text;
  v_first_name text;
  v_researcher_route text;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  FOR auth_user IN SELECT au.id, au.email, au.raw_user_meta_data FROM auth.users au LOOP
    v_full_name := NULLIF(auth_user.raw_user_meta_data ->> 'full_name', '');
    v_institution := NULLIF(auth_user.raw_user_meta_data ->> 'institution', '');
    v_phone := NULLIF(auth_user.raw_user_meta_data ->> 'phone', '');
    v_first_name := NULLIF(trim(split_part(COALESCE(v_full_name, ''), ' ', 1)), '');
    v_researcher_route := NULLIF(auth_user.raw_user_meta_data ->> 'researcher_route', '');
    IF EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth_user.id) THEN
      UPDATE public.user_profiles up SET
        full_name = COALESCE(v_full_name, up.full_name),
        email = COALESCE(auth_user.email, up.email),
        institution = COALESCE(v_institution, up.institution),
        phone = COALESCE(v_phone, up.phone),
        first_name = COALESCE(v_first_name, up.first_name),
        researcher_route = COALESCE(v_researcher_route, up.researcher_route),
        updated_at = now()
      WHERE up.user_id = auth_user.id;
      updated_count := updated_count + 1;
    ELSE
      INSERT INTO public.user_profiles (user_id, full_name, email, institution, phone, first_name, researcher_route)
      VALUES (auth_user.id, COALESCE(v_full_name, 'Nome não informado'), auth_user.email,
        COALESCE(v_institution, 'Instituição não informada'),
        COALESCE(v_phone, 'Telefone não informado'),
        COALESCE(v_first_name, 'Nome'), v_researcher_route);
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'inserted', inserted_count, 'updated', updated_count);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_user_profile(_id uuid, _user_id uuid, _full_name text, _email text, _institution text, _phone text, _first_name text, _researcher_route text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  INSERT INTO public.user_profiles (id, user_id, full_name, email, institution, phone, first_name, researcher_route)
  VALUES (_id, _user_id, _full_name, _email, _institution, _phone, _first_name, _researcher_route)
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, full_name = EXCLUDED.full_name, email = EXCLUDED.email,
    institution = EXCLUDED.institution, phone = EXCLUDED.phone, first_name = EXCLUDED.first_name,
    researcher_route = EXCLUDED.researcher_route, updated_at = now();
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- =========================================================
-- 3) Remove overly broad public SELECT policies on public buckets
--    (public buckets remain reachable via their public URLs)
-- =========================================================
DROP POLICY IF EXISTS "Allow public read access to event photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to news photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to tcc-geofisica" ON storage.objects;
DROP POLICY IF EXISTS "Calendar PDFs are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "History PDF public read" ON storage.objects;
DROP POLICY IF EXISTS "Laboratory photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read atas files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view news photos" ON storage.objects;
