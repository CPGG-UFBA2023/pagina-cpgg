import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, X, LogOut } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLoginTCC } from './AdminLoginTCC'
import { toast } from 'sonner'

interface EditButtonTCCProps {
  onEditModeChange: (isEditing: boolean) => void
}

export function EditButtonTCC({ onEditModeChange }: EditButtonTCCProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsAdmin(false)
      setIsEditing(false)
      onEditModeChange(false)
      return
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdminUser = adminData?.role === 'coordenacao'
    setIsAdmin(isAdminUser)
    if (!isAdminUser) {
      setIsEditing(false)
      onEditModeChange(false)
    }
  }

  const handleEditClick = () => {
    if (!isAdmin) {
      setShowLogin(true)
      return
    }
    
    const newEditState = !isEditing
    setIsEditing(newEditState)
    onEditModeChange(newEditState)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setIsEditing(false)
    onEditModeChange(false)
    toast.success('Logout realizado')
  }

  const handleLoginSuccess = () => {
    setIsAdmin(true)
    setIsEditing(true)
    onEditModeChange(true)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 flex gap-2 z-50">
        {isAdmin && isEditing && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="rounded-full w-12 h-12 shadow-lg bg-white hover:bg-gray-100"
            title="Sair"
          >
            <LogOut size={20} />
          </Button>
        )}
        <Button
          variant="default"
          size="icon"
          onClick={handleEditClick}
          className={`rounded-full w-12 h-12 shadow-lg ${
            isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={isEditing ? 'Fechar edição' : 'Editar'}
        >
          {isEditing ? <X size={20} /> : <Pencil size={20} />}
        </Button>
      </div>

      <AdminLoginTCC
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}
