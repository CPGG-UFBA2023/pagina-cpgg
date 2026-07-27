CREATE TABLE public.technician_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laboratory_id uuid NOT NULL REFERENCES public.laboratories(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_profiles TO authenticated;
GRANT ALL ON public.technician_profiles TO service_role;

ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Técnicos podem ver seu próprio perfil" ON public.technician_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Técnicos podem criar seu próprio perfil" ON public.technician_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Técnicos podem atualizar seu próprio perfil" ON public.technician_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Técnicos podem remover seu próprio perfil" ON public.technician_profiles
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar todos os perfis de técnicos" ON public.technician_profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER update_technician_profiles_updated_at BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();