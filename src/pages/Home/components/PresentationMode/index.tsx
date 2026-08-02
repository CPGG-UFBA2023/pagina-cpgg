import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './presentation.module.css'
import { supabase } from '@/integrations/supabase/client'
import buildingAsset from '@/assets/cpgg-building-aerial.jpg.asset.json'

interface NewsArticle {
  id: string
  title: string
  content: string
  photo1_url: string | null
  photo2_url: string | null
  photo3_url: string | null
  cover_photo_number: number
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  const withoutTags = html.replace(/<[^>]*>/g, ' ')
  const txt = document.createElement('textarea')
  txt.innerHTML = withoutTags
  return txt.value.replace(/\s+/g, ' ').trim()
}

const coverUrl = (a: NewsArticle) =>
  a.cover_photo_number === 2 ? a.photo2_url : a.cover_photo_number === 3 ? a.photo3_url : a.photo1_url

interface Props {
  onClose: () => void
}

export function PresentationMode({ onClose }: Props) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setNews(data || []))
  }, [])

  const slides = useMemo(
    () => [{ type: 'intro' as const }, ...news.map((n) => ({ type: 'news' as const, article: n }))],
    [news]
  )

  useEffect(() => {
    if (slides.length <= 1) return
    const duration = index === 0 ? 30000 : 15000
    const timer = setTimeout(() => setIndex((p) => (p + 1) % slides.length), duration)
    return () => clearTimeout(timer)
  }, [index, slides.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((p) => (p + 1) % slides.length)
      if (e.key === 'ArrowLeft') setIndex((p) => (p - 1 + slides.length) % slides.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, slides.length])

  const slide = slides[index] ?? slides[0]

  return (
    <div className={styles.overlay}>
      <button className={styles.close} onClick={onClose} aria-label="Sair do modo apresentação">
        <X size={28} />
      </button>

      {slide?.type === 'intro' ? (
        <div className={styles.slide}>
          <img src={buildingAsset.url} alt="Prédio do CPGG visto de cima" className={styles.bg} />
          <div className={styles.scrim} />
          <h1 className={styles.welcome}>Bem vindo(a) ao CPGG!</h1>
        </div>
      ) : slide?.type === 'news' ? (
        <div className={styles.slide}>
          {coverUrl(slide.article) && (
            <img src={coverUrl(slide.article) as string} alt={slide.article.title} className={styles.bg} />
          )}
          <div className={styles.scrim} />
          <div className={styles.newsBox}>
            <h2 className={styles.newsTitle}>{slide.article.title}</h2>
            <p className={styles.newsText}>{stripHtml(slide.article.content).substring(0, 420)}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === index ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
