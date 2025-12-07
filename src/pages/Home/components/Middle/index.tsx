import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import styles from './middle.module.css'
import earth from '../../../../assets/earth-photos.jpg'

interface NewsArticle {
  id: string
  title: string
  content: string
  photo1_url: string | null
  photo2_url: string | null
  photo3_url: string | null
  cover_photo_number: number
  news_position: string
}

export function Middle() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  useEffect(() => {
    if (!isPlaying || newsArticles.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsArticles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, newsArticles.length])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .in('news_position', ['News1', 'News2', 'News3'])
        .order('news_position')

      if (error) throw error

      setNewsArticles(data || [])
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCoverImageUrl = (article: NewsArticle) => {
    switch (article.cover_photo_number) {
      case 2:
        return article.photo2_url
      case 3:
        return article.photo3_url
      default:
        return article.photo1_url
    }
  }

  const getNewsRoute = (position: string) => {
    switch (position) {
      case 'News1':
        return '/News/News1'
      case 'News2':
        return '/News/News2'
      case 'News3':
        return '/News/News3'
      default:
        return '/News/News1'
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsArticles.length) % newsArticles.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsArticles.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  const fallbackImages = [
    '../../../../components/Figures/news1.png',
    '../../../../components/Figures/news2.png',
    '../../../../components/Figures/news3.png'
  ]

  if (loading) {
    return <div className={styles.loading}>Carregando notícias...</div>
  }

  const displayArticles = newsArticles.length > 0 ? newsArticles : []
  const currentArticle = displayArticles[currentIndex]

  return (
    <div className={styles.middleWrapper}>
      {/* Desktop: News on left, static text center, earth right */}
      {/* Mobile: Phrase section, then news section */}
      
      {/* Static phrase section */}
      <div className={styles.static}>
        <strong>Earth</strong>
        <h1>is our Goal</h1>
        <div className={styles.enjoy}>
          <h1>Enjoy our best solutions for </h1>
          <strong>scientific</strong>
          <h1>and trade proposals</h1>
        </div>
      </div>

      {/* News carousel section */}
      <div className={styles.carouselContainer}>
        {currentArticle && (
          <a href={getNewsRoute(currentArticle.news_position)} className={styles.newsLink}>
            <div className={styles.newsCard}>
              <div className={styles.imageWrapper}>
                <img 
                  src={getCoverImageUrl(currentArticle) || fallbackImages[currentIndex % 3]} 
                  alt={currentArticle.title}
                  className={styles.newsImage}
                />
              </div>
              <div className={styles.newsContent}>
                <h2 className={styles.newsTitle}>{currentArticle.title}</h2>
                <p className={styles.newsDescription}>
                  {currentArticle.content.substring(0, 150)}...
                </p>
              </div>
            </div>
          </a>
        )}

        {displayArticles.length > 1 && (
          <>
            <button 
              onClick={handlePrevious} 
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              aria-label="Notícia anterior"
            >
              <ChevronLeft size={32} />
            </button>

            <button 
              onClick={handleNext} 
              className={`${styles.navButton} ${styles.navButtonRight}`}
              aria-label="Próxima notícia"
            >
              <ChevronRight size={32} />
            </button>

            <div className={styles.controls}>
              <div className={styles.dots}>
                {displayArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                    aria-label={`Ir para notícia ${index + 1}`}
                  />
                ))}
              </div>
              <button 
                onClick={togglePlayPause} 
                className={styles.playPauseButton}
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'PARAR' : 'INICIAR'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Earth image - desktop only */}
      <div className={styles.earthContainer}>
        <img src={earth} alt="Earth" className={styles.earthImage} />
      </div>
    </div>
  )
}
