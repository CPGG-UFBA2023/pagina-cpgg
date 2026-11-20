CREATE OR REPLACE FUNCTION public.set_laboratory_photo_legend(_acronym text, _index integer, _legend text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _v text := NULLIF(btrim(coalesce(_legend, '')), '');
BEGIN
  IF NOT (public.can_access('laboratories') OR public.is_laiga_repo_user()) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;
  IF _index NOT IN (1,2,3,4) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Índice de foto inválido');
  END IF;
  UPDATE public.laboratories SET
    photo1_legend = CASE WHEN _index = 1 THEN _v ELSE photo1_legend END,
    photo2_legend = CASE WHEN _index = 2 THEN _v ELSE photo2_legend END,
    photo3_legend = CASE WHEN _index = 3 THEN _v ELSE photo3_legend END,
    photo4_legend = CASE WHEN _index = 4 THEN _v ELSE photo4_legend END,
    updated_at = now()
  WHERE acronym = _acronym;
  RETURN jsonb_build_object('success', true);
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_laboratory_photo_legend(text,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_laboratory_photo_legend(text,integer,text) TO authenticated;

DROP POLICY IF EXISTS "Allow public update access to visitor_locations" ON public.visitor_locations;
DROP POLICY IF EXISTS "Allow public insert access to visitor_locations" ON public.visitor_locations;

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;