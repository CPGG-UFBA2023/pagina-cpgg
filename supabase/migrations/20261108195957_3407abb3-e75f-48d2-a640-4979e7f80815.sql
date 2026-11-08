REVOKE ALL ON FUNCTION public.protect_access_admin_role() FROM PUBLIC,anon,authenticated;
ALTER FUNCTION public.my_access_permissions() SECURITY INVOKER;
-- These functions intentionally expose only a boolean for the caller or enforce access administration before returning/changing data.
COMMENT ON FUNCTION public.can_access(text) IS 'Returns only the authenticated caller permission; callable by anon for RLS, always false without auth.uid(). No arbitrary user lookup.';
COMMENT ON FUNCTION public.list_access_people() IS 'Authenticated access managers only; server-side can_access(access) enforced before reading identities.';
COMMENT ON FUNCTION public.set_access_permission(uuid,text,boolean) IS 'Authenticated access managers only; validated keys and account IDs, serialized changes, own access revocation prohibited.';
COMMENT ON FUNCTION public.is_laiga_repo_user() IS 'Returns only caller repository access and honors explicit central permission overrides.';