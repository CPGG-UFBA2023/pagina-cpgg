-- Non-destructive database assertions: all temporary rows are rolled back by the sentinel exception.
DO $$
DECLARE coordinator uuid; researcher uuid; caught boolean;
BEGIN
 SELECT user_id INTO coordinator FROM public.admin_users WHERE role='coordenacao' AND user_id IS NOT NULL LIMIT 1;
 SELECT p.user_id INTO researcher FROM public.user_profiles p WHERE p.user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.admin_users a WHERE a.user_id=p.user_id) LIMIT 1;
 IF coordinator IS NULL OR researcher IS NULL THEN RAISE EXCEPTION 'Authorization test requires existing coordinator and researcher accounts'; END IF;
 BEGIN
   PERFORM set_config('request.jwt.claim.sub',researcher::text,true);
   DELETE FROM public.user_access_permissions WHERE user_id=researcher AND permission IN ('access','atas');
   IF public.can_access('access') THEN RAISE EXCEPTION 'A researcher must not administer privileges by default'; END IF;
   caught:=false;
   BEGIN PERFORM public.set_access_permission(researcher,'atas',true); EXCEPTION WHEN insufficient_privilege THEN caught:=true; END;
   IF NOT caught THEN RAISE EXCEPTION 'A researcher granted their own privilege'; END IF;
   PERFORM set_config('request.jwt.claim.sub',coordinator::text,true);
   DELETE FROM public.user_access_permissions WHERE user_id=coordinator AND permission='access';
   IF NOT public.can_access('access') THEN RAISE EXCEPTION 'Coordination must administer access by default'; END IF;
   PERFORM public.set_access_permission(researcher,'atas',true);
   PERFORM set_config('request.jwt.claim.sub',researcher::text,true);
   IF NOT public.can_access('atas') THEN RAISE EXCEPTION 'Granted Atas access was not effective'; END IF;
   PERFORM set_config('request.jwt.claim.sub',coordinator::text,true);
   PERFORM public.set_access_permission(researcher,'atas',false);
   PERFORM set_config('request.jwt.claim.sub',researcher::text,true);
   IF public.can_access('atas') THEN RAISE EXCEPTION 'Revoked Atas access remained effective'; END IF;
   PERFORM set_config('request.jwt.claim.sub',coordinator::text,true);
   caught:=false;
   BEGIN PERFORM public.set_access_permission(coordinator,'access',false); EXCEPTION WHEN raise_exception THEN caught:=true; END;
   IF NOT caught THEN RAISE EXCEPTION 'Admin was allowed to remove own access'; END IF;
   caught:=false;
   BEGIN PERFORM public.set_access_permission(researcher,'unknown_permission',true); EXCEPTION WHEN raise_exception THEN caught:=true; END;
   IF NOT caught THEN RAISE EXCEPTION 'Invalid privilege accepted'; END IF;
   IF jsonb_array_length(public.list_access_people())=0 THEN RAISE EXCEPTION 'Administrative people list is empty'; END IF;
   RAISE EXCEPTION 'authorization_tests_passed' USING ERRCODE='Z0001';
 EXCEPTION WHEN SQLSTATE 'Z0001' THEN NULL;
 END;
END $$;