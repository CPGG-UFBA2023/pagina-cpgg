import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './NewsImageLightbox.module.css'

interface NewsImageLightboxProps {
  src: string
  alt: string
  className?: string
}

export function NewsImageLightbox({ src, alt, className }: NewsImageLightboxProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={() => setOpen(true)}
      />

      {open &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Imagem ampliada"
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              aria-label="Fechar imagem"
            >
              <X size={32} />
            </button>

            <img
              src={src}
              alt={alt}
              className={styles.overlayImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body as HTMLElement
        )}
    </>
  )
}
