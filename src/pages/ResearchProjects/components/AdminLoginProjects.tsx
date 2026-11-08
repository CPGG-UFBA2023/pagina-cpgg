import { AdminAuthDialog } from '@/components/AdminAuthDialog'

interface AdminLoginProjectsProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function AdminLoginProjects({ isOpen, onClose, onLogin }: AdminLoginProjectsProps) {
  const handleSuccess = () => onLogin()

  return (
    <AdminAuthDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      requiredRole="any"
      permission="projects"
      title="Login Administrativo - Projetos de Pesquisa"
    />
  )
}
