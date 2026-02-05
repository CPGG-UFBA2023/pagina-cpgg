import { useEffect } from 'react'

interface EditButtonTCCProps {
  onClick: () => void
  isEditMode: boolean
  onLogout: () => void
}

export function EditButtonTCC({ onClick, isEditMode, onLogout }: EditButtonTCCProps) {
  useEffect(() => {
    const oldButton = document.getElementById('floating-edit-button-tcc')
    if (oldButton) oldButton.remove()

    const button = document.createElement('button')
    button.id = 'floating-edit-button-tcc'
    button.innerHTML = isEditMode 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>Sair`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>`
    
    button.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 999999999 !important;
      padding: ${isEditMode ? '10px 16px' : '12px'} !important;
      border-radius: ${isEditMode ? '8px' : '50%'} !important;
      background-color: ${isEditMode ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} !important;
      color: ${isEditMode ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--primary-foreground))'} !important;
      border: none !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: auto !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;
      width: ${isEditMode ? 'auto' : '48px'} !important;
      height: 48px !important;
    `

    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (isEditMode) {
        onLogout()
      } else {
        onClick()
      }
    })

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)'
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
      button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
    })

    document.body.appendChild(button)

    return () => {
      const btn = document.getElementById('floating-edit-button-tcc')
      if (btn) btn.remove()
    }
  }, [isEditMode, onClick, onLogout])

  return null
}
