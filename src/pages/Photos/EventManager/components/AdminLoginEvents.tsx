import { AdminAuthDialog } from '@/components/AdminAuthDialog'

interface AdminLoginEventsProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function AdminLoginEvents({ isOpen, onClose, onLogin }: AdminLoginEventsProps) {
  const handleSuccess = () => onLogin()

  return (
    <AdminAuthDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      requiredRole="any"
      permission="photos"
      title="Login Administrativo - Eventos"
    />
  )
}
