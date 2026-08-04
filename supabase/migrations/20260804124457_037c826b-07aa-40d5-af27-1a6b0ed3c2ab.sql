CREATE OR REPLACE FUNCTION public.set_laboratory_photo(_acronym text, _index integer, _url text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _allowed boolean;
BEGIN
  IF _index NOT IN (1,2,3,4) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Índice de foto inválido');
  END IF;

  SELECT public.is_admin() OR public.is_laiga_repo_user() INTO _allowed;

  IF NOT _allowed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para editar fotos');
  END IF;

  EXECUTE format('UPDATE public.laboratories SET photo%s_url = $1, updated_at = now() WHERE acronym = $2', _index)
  USING _url, _acronym;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_laboratory_photo(text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_laboratory_photo(text, integer, text) TO authenticated;