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
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        setIsAdmin(false)
        setIsEditing(false)
        onEditModeChange(false)
        return
      }
      
      if (!user) {
        setIsAdmin(false)
        setIsEditing(false)
        onEditModeChange(false)
        return
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error checking admin status:', adminError)
      }

      const isAdminUser = adminData?.role === 'coordenacao'
      setIsAdmin(isAdminUser)
      if (!isAdminUser) {
        setIsEditing(false)
        onEditModeChange(false)
      }
    } catch (error) {
      console.error('Unexpected error in checkAdminStatus:', error)
      setIsAdmin(false)
      setIsEditing(false)
      onEditModeChange(false)
    }
  }

  const handleEditClick = () => {
    try {
      if (!isAdmin) {
        setShowLogin(true)
        return
      }
      
      const newEditState = !isEditing
      setIsEditing(newEditState)
      onEditModeChange(newEditState)
    } catch (error) {
      console.error('Error in handleEditClick:', error)
      toast.error('Erro ao alternar modo de edição')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAdmin(false)
      setIsEditing(false)
      onEditModeChange(false)
      toast.success('Logout realizado')
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const handleLoginSuccess = () => {
    try {
      setIsAdmin(true)
      setIsEditing(true)
      onEditModeChange(true)
    } catch (error) {
      console.error('Error in handleLoginSuccess:', error)
    }
  }

  return (
    <>
      <div 
        className="fixed bottom-6 right-6 flex gap-2" 
        style={{ zIndex: 99999, pointerEvents: 'auto' }}
      >
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
