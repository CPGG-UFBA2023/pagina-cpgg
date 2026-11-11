INSERT INTO public.user_profiles (user_id, full_name, email, institution, phone, first_name, researcher_route)
SELECT NULL, 'Michel Nascimento da Silva', 'michelns@ufba.br', 'UFBA', '(00) 00000-0000', 'Michel', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE lower(email)='michelns@ufba.br' OR lower(full_name)='michel nascimento da silva');