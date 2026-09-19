import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

const ADMIN_ROLES = ['coordenacao', 'ti', 'secretaria']

/**
 * Tracks whether the current visitor is a logged-in photo admin.
 * Re-checks on every auth state change so signing out immediately
 * hides edit/delete options (and an expired session does too).
 */
export function usePhotoAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let active = true

    const resolve = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        if (active) setIsAuthenticated(false)
        return
      }
      const { data: role } = await supabase.rpc('get_admin_role')
      if (active) setIsAuthenticated(ADMIN_ROLES.includes(role ?? ''))
    }

    resolve()
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      // Defer to avoid supabase-js re-entrancy inside the auth callback.
      setTimeout(resolve, 0)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return { isAuthenticated, setIsAuthenticated }
}
