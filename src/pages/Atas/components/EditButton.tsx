import { LogOut, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from '../Atas.module.css'

interface EditButtonProps {
  onClick: () => void
  isEditMode: boolean
  onLogout: () => void
}

export function EditButton({ onClick, isEditMode, onLogout }: EditButtonProps) {
  const label = isEditMode ? 'Sair do modo de edição' : 'Editar Atas'

  return (
    <Button
      id="floating-edit-button-atas"
      className={styles.editButton}
      variant={isEditMode ? 'destructive' : 'default'}
      size="icon"
      aria-label={label}
      title={label}
      onClick={isEditMode ? onLogout : onClick}
    >
      {isEditMode ? <LogOut size={20} /> : <Pencil size={20} />}
    </Button>
  )
}
