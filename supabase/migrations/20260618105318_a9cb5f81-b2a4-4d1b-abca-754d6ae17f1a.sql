CREATE OR REPLACE FUNCTION public.auto_create_user_profile_for_researcher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  email_slug text;
  temp_email text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE lower(full_name) = lower(NEW.name)
  ) THEN
    email_slug := regexp_replace(
      regexp_replace(lower(unaccent(NEW.name)), '[^a-z0-9]+', '.', 'g'),
      '(^\.|\.$)', '', 'g'
    );
    temp_email := email_slug || '.' || extract(epoch from clock_timestamp())::bigint || '@a-definir.temporario';

    INSERT INTO public.user_profiles (
      full_name, first_name, email, institution, phone, researcher_route
    ) VALUES (
      NEW.name,
      trim(split_part(NEW.name, ' ', 1)),
      temp_email,
      COALESCE(NEW.institution, 'UFBA'),
      '(00) 00000-0000',
      'pesquisador'
    );
  END IF;
  RETURN NEW;
END;
$function$;