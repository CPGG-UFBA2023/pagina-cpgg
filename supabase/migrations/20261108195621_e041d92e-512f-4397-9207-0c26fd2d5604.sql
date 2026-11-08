CREATE TABLE public.user_access_permissions (user_id uuid NOT NULL, permission text NOT NULL, allowed boolean NOT NULL DEFAULT false, changed_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,permission));
GRANT SELECT ON public.user_access_permissions TO authenticated;
GRANT ALL ON public.user_access_permissions TO service_role;
ALTER TABLE public.user_access_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_permissions ON public.user_access_permissions FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TRIGGER permissions_updated BEFORE UPDATE ON public.user_access_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.access_permission_audit (user_id uuid NOT NULL, permission text NOT NULL, previous_allowed boolean NOT NULL, allowed boolean NOT NULL, changed_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), id uuid PRIMARY KEY DEFAULT gen_random_uuid());
GRANT SELECT ON public.access_permission_audit TO authenticated;
GRANT ALL ON public.access_permission_audit TO service_role;
ALTER TABLE public.access_permission_audit ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER permission_audit_updated BEFORE UPDATE ON public.access_permission_audit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE FUNCTION public.access_permission_keys() RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT ARRAY['atas','news','photos','calendars','publications','projects','regulations','history','tcc','laboratories','equipment','repository','reservations','people','access']::text[] $$;
CREATE FUNCTION public.has_access_permission(_user_id uuid,_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE override_value boolean; admin_role text;
BEGIN
 IF _user_id IS NULL OR NOT (_permission=ANY(public.access_permission_keys())) THEN RETURN false; END IF;
 SELECT allowed INTO override_value FROM public.user_access_permissions WHERE user_id=_user_id AND permission=_permission;
 IF FOUND THEN RETURN override_value; END IF;
 SELECT role INTO admin_role FROM public.admin_users WHERE user_id=_user_id LIMIT 1;
 IF _permission='access' THEN RETURN coalesce(admin_role='coordenacao',false); END IF;
 IF _permission='repository' THEN
 RETURN EXISTS(SELECT 1 FROM public.laiga_repository_access WHERE user_id=_user_id)
 OR EXISTS(SELECT 1 FROM public.technician_profiles WHERE user_id=_user_id)
 OR EXISTS(SELECT 1 FROM public.laboratories l LEFT JOIN public.user_profiles p ON p.user_id=_user_id LEFT JOIN auth.users u ON u.id=_user_id WHERE l.chief_user_id=_user_id OR l.chief_user_id=p.id OR lower(l.chief_alternative_email)=lower(u.email) OR lower(l.chief_name)=lower(p.full_name) OR lower(l.technician_name)=lower(p.full_name));
 END IF;
 IF admin_role='coordenacao' THEN RETURN true; END IF;
 IF _permission IN ('atas','calendars','equipment','people') THEN RETURN coalesce(admin_role='secretaria',false); END IF;
 IF _permission IN ('news','photos','publications','projects','regulations','laboratories','reservations') THEN RETURN coalesce(admin_role IN ('secretaria','ti'),false); END IF;
 RETURN false;
END; $$;
REVOKE ALL ON FUNCTION public.has_access_permission(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.has_access_permission(uuid,text) TO service_role;
CREATE FUNCTION public.can_access(_permission text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_access_permission(auth.uid(),_permission) $$;
REVOKE ALL ON FUNCTION public.can_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access(text) TO anon,authenticated,service_role;
CREATE POLICY access_managers_read_permissions ON public.user_access_permissions FOR SELECT TO authenticated USING(public.can_access('access'));
CREATE POLICY access_managers_read_audit ON public.access_permission_audit FOR SELECT TO authenticated USING(public.can_access('access'));
CREATE FUNCTION public.my_access_permissions() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce(jsonb_object_agg(k,public.can_access(k)),'{}'::jsonb) FROM unnest(public.access_permission_keys()) k $$;
REVOKE ALL ON FUNCTION public.my_access_permissions() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.my_access_permissions() TO authenticated,service_role;
CREATE FUNCTION public.list_access_people() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.can_access('access') THEN RAISE EXCEPTION 'Sem permissão para administrar acessos' USING ERRCODE='42501'; END IF;
 WITH identities AS (
 SELECT p.id::text AS identity_id,p.user_id,p.full_name,p.email,
 CASE WHEN a.role='coordenacao' THEN 'Administração' WHEN a.role='secretaria' THEN 'Secretaria' WHEN a.role='ti' THEN 'TI' WHEN EXISTS(SELECT 1 FROM public.technician_profiles t WHERE t.user_id=p.user_id) OR EXISTS(SELECT 1 FROM public.laboratories l WHERE lower(btrim(l.technician_name))=lower(btrim(p.full_name))) THEN 'Técnico' WHEN p.researcher_route IS NOT NULL OR EXISTS(SELECT 1 FROM public.researchers r WHERE lower(btrim(r.name))=lower(btrim(p.full_name))) THEN 'Pesquisador' ELSE 'Usuário' END AS category
 FROM public.user_profiles p LEFT JOIN public.admin_users a ON a.user_id=p.user_id
 UNION ALL SELECT 'admin:'||a.id,a.user_id,coalesce(a.full_name,a.email),a.email,CASE a.role WHEN 'coordenacao' THEN 'Administração' WHEN 'secretaria' THEN 'Secretaria' ELSE 'TI' END FROM public.admin_users a WHERE NOT EXISTS(SELECT 1 FROM public.user_profiles p WHERE p.user_id=a.user_id OR lower(p.email)=lower(a.email))
 UNION ALL SELECT 'researcher:'||r.id,NULL,r.name,r.email,'Pesquisador' FROM public.researchers r WHERE NOT EXISTS(SELECT 1 FROM public.user_profiles p WHERE lower(btrim(p.full_name))=lower(btrim(r.name)))
 UNION ALL SELECT 'technician:'||t.id,t.user_id,coalesce(u.raw_user_meta_data->>'full_name',u.email,'Técnico'),u.email,'Técnico' FROM public.technician_profiles t JOIN auth.users u ON u.id=t.user_id WHERE NOT EXISTS(SELECT 1 FROM public.user_profiles p WHERE p.user_id=t.user_id)
 ) SELECT coalesce(jsonb_agg(jsonb_build_object('id',identity_id,'user_id',i.user_id,'name',full_name,'email',email,'category',category,'permissions',(SELECT jsonb_object_agg(k,public.has_access_permission(i.user_id,k)) FROM unnest(public.access_permission_keys()) k)) ORDER BY lower(full_name)),'[]'::jsonb) INTO result FROM identities i;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.list_access_people() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_access_people() TO authenticated,service_role;
CREATE FUNCTION public.set_access_permission(_user_id uuid,_permission text,_allowed boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE previous boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(76291001);
 IF NOT public.can_access('access') THEN RAISE EXCEPTION 'Sem permissão para administrar acessos' USING ERRCODE='42501'; END IF;
 IF _permission IS NULL OR NOT (_permission=ANY(public.access_permission_keys())) OR _allowed IS NULL THEN RAISE EXCEPTION 'Permissão inválida'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=_user_id) THEN RAISE EXCEPTION 'Esta pessoa ainda não possui uma conta'; END IF;
 IF _permission='access' AND _user_id=auth.uid() AND NOT _allowed THEN RAISE EXCEPTION 'Você não pode remover sua própria administração de acessos'; END IF;
 previous:=public.has_access_permission(_user_id,_permission);
 INSERT INTO public.user_access_permissions(user_id,permission,allowed,changed_by) VALUES(_user_id,_permission,_allowed,auth.uid()) ON CONFLICT(user_id,permission) DO UPDATE SET allowed=EXCLUDED.allowed,changed_by=EXCLUDED.changed_by,updated_at=now();
 INSERT INTO public.access_permission_audit(user_id,permission,previous_allowed,allowed,changed_by) VALUES(_user_id,_permission,previous,_allowed,auth.uid());
END; $$;
REVOKE ALL ON FUNCTION public.set_access_permission(uuid,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_access_permission(uuid,text,boolean) TO authenticated,service_role;
DO $$ DECLARE rec record; key text; table_name text; BEGIN
 FOR table_name,key IN SELECT * FROM (VALUES ('atas','atas'),('news','news'),('events','photos'),('event_photos','photos'),('calendars','calendars'),('scientific_publications','publications'),('research_projects','projects'),('regulations','regulations'),('history_documents','history'),('tcc_geofisica','tcc'),('laboratories','laboratories'),('laboratory_equipments','equipment'),('laiga_equipment','equipment'),('laiga_equipments','equipment'),('researchers','people')) x(t,k) LOOP
  FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name AND cmd<>'SELECT' LOOP EXECUTE format('DROP POLICY %I ON public.%I',rec.policyname,table_name); END LOOP;
  EXECUTE format('CREATE POLICY permission_insert ON public.%I FOR INSERT TO authenticated WITH CHECK(public.can_access(%L))',table_name,key);
  EXECUTE format('CREATE POLICY permission_update ON public.%I FOR UPDATE TO authenticated USING(public.can_access(%L)) WITH CHECK(public.can_access(%L))',table_name,key,key);
  EXECUTE format('CREATE POLICY permission_delete ON public.%I FOR DELETE TO authenticated USING(public.can_access(%L))',table_name,key);
 END LOOP;
 FOR table_name IN SELECT unnest(ARRAY['reservations','repair_requests']) LOOP
  FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name AND cmd<>'INSERT' LOOP EXECUTE format('DROP POLICY %I ON public.%I',rec.policyname,table_name); END LOOP;
  EXECUTE format('CREATE POLICY permission_read ON public.%I FOR SELECT TO authenticated USING(public.can_access(''reservations''))',table_name);
  EXECUTE format('CREATE POLICY permission_update ON public.%I FOR UPDATE TO authenticated USING(public.can_access(''reservations'')) WITH CHECK(public.can_access(''reservations''))',table_name);
  EXECUTE format('CREATE POLICY permission_delete ON public.%I FOR DELETE TO authenticated USING(public.can_access(''reservations''))',table_name);
 END LOOP;
END $$;
-- Protect staff-role rows from self-promotion; people management is distinct from assigning privileges.
DO $$ DECLARE rec record; BEGIN FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' LOOP EXECUTE format('DROP POLICY %I ON public.admin_users',rec.policyname); END LOOP; END $$;
CREATE POLICY staff_read ON public.admin_users FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.can_access('people') OR public.can_access('access'));
CREATE POLICY staff_insert ON public.admin_users FOR INSERT TO authenticated WITH CHECK(public.can_access('access'));
CREATE POLICY staff_update ON public.admin_users FOR UPDATE TO authenticated USING(public.can_access('access')) WITH CHECK(public.can_access('access'));
CREATE POLICY staff_delete ON public.admin_users FOR DELETE TO authenticated USING(public.can_access('access') AND user_id IS DISTINCT FROM auth.uid());
CREATE FUNCTION public.protect_access_admin_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.role='coordenacao' AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN RAISE EXCEPTION 'Altere os privilégios pela lista de acessos, sem remover o papel de administração'; END IF;
 IF TG_OP='DELETE' AND OLD.role='coordenacao' THEN RAISE EXCEPTION 'Altere os privilégios pela lista de acessos, sem excluir a administração'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER protect_access_admin BEFORE UPDATE OR DELETE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.protect_access_admin_role();
CREATE POLICY people_manage_profiles ON public.user_profiles FOR ALL TO authenticated USING(public.can_access('people')) WITH CHECK(public.can_access('people'));
DO $$ DECLARE rec record; BEGIN FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND (cmd='DELETE' OR (cmd='INSERT' AND with_check LIKE '%admin_users%')) LOOP EXECUTE format('DROP POLICY %I ON public.user_profiles',rec.policyname); END LOOP; END $$;
CREATE OR REPLACE FUNCTION public.is_laiga_repo_user() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.can_access('repository') $$;
DO $$ DECLARE rec record; t text; BEGIN FOR t IN SELECT unnest(ARRAY['laiga_repository_access','laiga_repository_folders','laiga_repository_items']) LOOP FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP EXECUTE format('DROP POLICY %I ON public.%I',rec.policyname,t); END LOOP;
 EXECUTE format('CREATE POLICY repository_permissions ON public.%I FOR ALL TO authenticated USING(public.can_access(%L)) WITH CHECK(public.can_access(%L))',t,CASE WHEN t='laiga_repository_access' THEN 'access' ELSE 'repository' END,CASE WHEN t='laiga_repository_access' THEN 'access' ELSE 'repository' END);
END LOOP; END $$;
-- Keep public file reads, replace write rules with matching area privileges.
DO $$ DECLARE rec record; bucket text; key text; BEGIN
 FOR rec IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND cmd<>'SELECT' AND (coalesce(qual,'')||coalesce(with_check,'')) ~ '(atas|calendars|news-photos|event-photos|history-pdf|tcc-geofisica|laiga-repository|laboratory-photos)' LOOP EXECUTE format('DROP POLICY %I ON storage.objects',rec.policyname); END LOOP;
 FOR bucket,key IN SELECT * FROM (VALUES ('atas','atas'),('calendars','calendars'),('news-photos','news'),('event-photos','photos'),('history-pdf','history'),('tcc-geofisica','tcc'),('laiga-repository','repository'),('laboratory-photos','laboratories')) x(b,k) LOOP
 EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id=%L AND public.can_access(%L))','access_'||bucket||'_insert',bucket,key);
 EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING(bucket_id=%L AND public.can_access(%L)) WITH CHECK(bucket_id=%L AND public.can_access(%L))','access_'||bucket||'_update',bucket,key,bucket,key);
 EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING(bucket_id=%L AND public.can_access(%L))','access_'||bucket||'_delete',bucket,key);
 END LOOP;
END $$;
CREATE POLICY repository_file_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='laiga-repository' AND public.can_access('repository'));
CREATE OR REPLACE FUNCTION public.set_researcher_as_chief(_researcher_id uuid,_program text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.can_access('people') THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
 UPDATE public.researchers SET is_chief=false WHERE program=_program AND is_chief=true;
 UPDATE public.researchers SET is_chief=true WHERE id=_researcher_id AND program=_program;
END $$;
-- Existing security-definer management RPCs must respect explicit overrides too.
DO $$ DECLARE f record; definition text; key text; BEGIN
 FOR f IN SELECT p.oid,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('list_all_user_profiles','sync_auth_users_to_profiles','reset_user_keep_profile_data','restore_user_profile','delete_user_complete','delete_user_profile','create_admin_from_panel','create_admin_user','set_laboratory_photo','set_laboratory_photo_legend') LOOP
 key:=CASE WHEN f.proname IN ('create_admin_from_panel','create_admin_user') THEN 'access' WHEN f.proname LIKE 'set_laboratory_%' THEN 'laboratories' ELSE 'people' END;
 definition:=pg_get_functiondef(f.oid);
 definition:=regexp_replace(definition,'BEGIN',format('BEGIN IF NOT public.can_access(%L) THEN RAISE EXCEPTION ''Sem permissão'' USING ERRCODE=''42501''; END IF;',key));
 definition:=replace(definition,'public.is_admin()',format('public.can_access(%L)',key));
 IF f.proname='list_all_user_profiles' THEN definition:=replace(definition,'public.is_admin()', 'public.can_access(''people'')'); END IF;
 IF f.proname='delete_user_complete' THEN definition:=replace(definition,'IF _admin_role IS NULL OR _admin_role != ''coordenacao'' THEN','IF NOT public.can_access(''people'') THEN'); END IF;
 IF f.proname='delete_user_profile' THEN definition:=replace(definition,'IF _admin_role IS NULL THEN','IF NOT public.can_access(''people'') THEN'); END IF;
 EXECUTE definition;
 END LOOP;
END $$;