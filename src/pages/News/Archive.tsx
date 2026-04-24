import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { Newspaper } from 'lucide-react'
import styles from './Archive.module.css'

interface NewsItem {
  id: string
  title: string
  archive_number: number
  created_at: string
}

export function NewsArchive() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, archive_number, created_at')
        .order('archive_number', { ascending: false })

      if (!error && data) setItems(data as NewsItem[])
      setLoading(false)
    }
    fetchAll()
  }, [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Arquivo de Notícias</h1>
          <p className={styles.subtitle}>Todas as notícias publicadas no CPGG</p>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>Nenhuma notícia encontrada.</div>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => (
                <li key={n.id} className={styles.item}>
                  <Link to={`/News/${n.archive_number}`} className={styles.link}>
                    <Newspaper size={20} className={styles.icon} />
                    <span className={styles.itemTitle}>{n.title}</span>
                    <span className={styles.itemDate}>{formatDate(n.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
