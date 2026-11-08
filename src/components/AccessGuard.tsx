import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccessPermissions } from '@/hooks/useAccessPermissions'
import { hasAnyPermission, type PermissionKey } from '@/lib/accessPermissions'

export function AccessGuard({ permission, children }: { permission?: PermissionKey; children: ReactNode }) {
  const { permissions, loading } = useAccessPermissions()
  if (loading) return <div role="status" className="p-6 text-foreground bg-background">Verificando acesso…</div>
  if (permission ? permissions[permission] !== true : !hasAnyPermission(permissions)) return <Navigate to="/adm/coordenacao" replace />
  return <>{children}</>
}