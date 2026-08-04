import { useEffect, useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { ExternalLink, FileDown } from 'lucide-react'
import { NewsImageLightbox } from '../../components/NewsImageLightbox'
import { NewsMediaEditor } from '../../components/NewsMediaEditor'
import styles from './News.module.css'


interface NewsArticle {
  id: string
  title: string
  content: string
  photo1_url: string | null
  photo2_url: string | null
  photo3_url: string | null
  cover_photo_number: number
  external_link: string | null
  pdf1_url: string | null
  pdf1_title: string | null
  pdf2_url: string | null
  pdf2_title: string | null
  pdf3_url: string | null
  pdf3_title: string | null
}

export function News2() {
  const [news, setNews] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('news_position', 'News2')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setNews(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Carregando notícia...</div>
        <Footer />
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.main}>
          <div className={styles.error}>
            <h1 className={styles.errorTitle}>Notícia não encontrada</h1>
            <p className={styles.errorMessage}>
              Esta notícia ainda não foi publicada ou ocorreu um erro ao carregá-la.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const photos = [news.photo1_url, news.photo2_url, news.photo3_url].filter(Boolean)
  const pdfs = [
    { url: news.pdf1_url, title: news.pdf1_title },
    { url: news.pdf2_url, title: news.pdf2_title },
    { url: news.pdf3_url, title: news.pdf3_title },
  ].filter(p => p.url)

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>{news.title}</h1>
            <div className={styles.text} dangerouslySetInnerHTML={{ __html: news.content }} />
            
            {(news.external_link || pdfs.length > 0) && (
              <div className={styles.attachments}>
                {news.external_link && (
                  <a href={news.external_link} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                    <ExternalLink size={18} />
                    <span>Acessar link externo</span>
                  </a>
                )}
                {pdfs.map((pdf, index) => (
                  <a key={index} href={pdf.url!} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                    <FileDown size={18} />
                    <span>{pdf.title || `Baixar PDF ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {photos.length > 0 && (
            <div className={styles.sidebar}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoContainer}>
                  <NewsImageLightbox
                    src={photo!}
                    alt={`Foto ${index + 1} da notícia`}
                    className={styles.photo}
                  />
                </div>

              ))}
            </div>
          )}
        </div>
      </main>
      <NewsMediaEditor news={news} onSaved={fetchNews} />
      <Footer />
    </div>
  )
}
