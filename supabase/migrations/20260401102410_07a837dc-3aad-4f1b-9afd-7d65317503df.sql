
-- Trigger function: ao inserir pesquisador, criar user_profile automaticamente
CREATE OR REPLACE FUNCTION public.auto_create_user_profile_for_researcher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se já existe um perfil com esse nome
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE lower(full_name) = lower(NEW.name)
  ) THEN
    INSERT INTO public.user_profiles (
      full_name,
      first_name,
      email,
      institution,
      phone,
      researcher_route
    ) VALUES (
      NEW.name,
      trim(split_part(NEW.name, ' ', 1)),
      'email.provisorio@aguardando.cadastro',
      COALESCE(NEW.institution, 'UFBA'),
      '(00) 00000-0000',
      'pesquisador'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Criar o trigger na tabela researchers
CREATE TRIGGER on_researcher_insert_create_profile
AFTER INSERT ON public.researchers
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_user_profile_for_researcher();
