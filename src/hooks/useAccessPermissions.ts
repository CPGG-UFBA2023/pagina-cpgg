import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { hasAnyPermission, type Permissions, type PermissionKey } from '@/lib/accessPermissions'

export async function resolveAdminSession(permission?: PermissionKey) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: permissions, error: accessError } = await supabase.rpc('my_access_permissions')
  if (accessError || !permissions || typeof permissions !== 'object' || Array.isArray(permissions)) return null
  const access = permissions as Permissions
  if (permission ? access[permission] !== true : !hasAnyPermission(access)) return null
  const { data: role } = await supabase.rpc('get_admin_role')
  return { id: user.id, email: user.email ?? '', role: role ?? 'delegado', permissions: access }
}

export function useAccessPermissions() {
  const [permissions, setPermissions] = useState<Permissions>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    const user = await resolveAdminSession()
    setPermissions(user?.permissions ?? {})
    setUserId(user?.id ?? null)
    setLoading(false)
  }, [])
  useEffect(() => {
    void refresh()
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(() => void refresh(), 0) })
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    window.addEventListener('access-permissions-changed', onFocus)
    return () => {
      data.subscription.unsubscribe()
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('access-permissions-changed', onFocus)
    }
  }, [refresh])
  return { permissions, userId, loading, refresh }
}