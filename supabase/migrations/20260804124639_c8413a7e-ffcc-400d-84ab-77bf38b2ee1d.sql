CREATE OR REPLACE FUNCTION public.set_laboratory_photo_legend(_acronym text, _index integer, _legend text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _index NOT IN (1,2,3,4) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Índice de foto inválido');
  END IF;

  IF NOT (public.is_admin() OR public.is_laiga_repo_user()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para editar legendas');
  END IF;

  EXECUTE format('UPDATE public.laboratories SET photo%s_legend = $1, updated_at = now() WHERE acronym = $2', _index)
  USING NULLIF(btrim(coalesce(_legend, '')), ''), _acronym;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_laboratory_photo_legend(text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_laboratory_photo_legend(text, integer, text) TO authenticated;