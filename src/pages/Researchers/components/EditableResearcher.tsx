import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Researcher {
  name: string
  route: string
  chief?: boolean
}

interface EditableResearcherProps {
  researcher: any
  isEditMode: boolean
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSetChief?: (id: string, programKey: string) => Promise<void>
  dbResearchers: any[]
}

export function EditableResearcher({ 
  researcher, 
  isEditMode, 
  onUpdate, 
  onDelete,
  onSetChief,
  dbResearchers 
}: EditableResearcherProps) {
  const [editedName, setEditedName] = useState(researcher.name)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingChief, setIsSettingChief] = useState(false)

  // Todos os pesquisadores agora são do banco de dados
  const researcherId = researcher.id || researcher.route.split('/').pop()

  const handleNameChange = async () => {
    if (editedName === researcher.name) return

    setIsLoading(true)
    try {
      await onUpdate(researcherId, editedName)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameChange()
    }
  }

  const handleSetChief = async () => {
    if (!researcherId || !onSetChief) return
    
    setIsSettingChief(true)
    try {
      await onSetChief(researcherId, researcher.programKey || '')
    } finally {
      setIsSettingChief(false)
    }
  }

  if (!isEditMode) {
    return (
      <nav className="researcher-nav-item" style={{ margin: '0.25rem 0', display: 'block' }}>
        <Link 
          to={researcher.route}
          className="researcher-link"
          style={{
            display: 'block',
            color: researcher.isChief ? '#facc15' : 'rgba(255, 255, 255, 0.95)',
            fontWeight: researcher.isChief ? '600' : 'normal',
            fontSize: '0.9rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            visibility: 'visible',
            opacity: 1
          }}
        >
          {researcher.name}
          {researcher.isChief && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>(Chefe)</span>}
        </Link>
      </nav>
    )
  }

  return (
    <>
      <nav className="flex items-center gap-2 group">
        {onSetChief && (
          <Button
            size="sm"
            variant={researcher.isChief ? "default" : "outline"}
            className={`h-8 w-8 p-0 shrink-0 ${
              researcher.isChief 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600' 
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
            onClick={handleSetChief}
            disabled={isLoading || isSettingChief}
            title={researcher.isChief ? "Coordenador do programa" : "Marcar como coordenador"}
          >
            <Star className={`w-4 h-4 ${researcher.isChief ? 'fill-current' : ''}`} />
          </Button>
        )}
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleNameChange}
          onKeyPress={handleKeyPress}
          className="h-8 text-sm bg-background text-foreground border-border focus:border-ring flex-1"
          disabled={isLoading}
          placeholder="Nome do pesquisador"
        />
      </nav>
    </>
  )
}