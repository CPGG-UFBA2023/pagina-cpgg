CREATE POLICY "Users can read their own admin role"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);