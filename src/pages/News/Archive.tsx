import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { Newspaper, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Archive.module.css'

interface NewsItem {
  id: string
  title: string
  archive_number: number
  created_at: string
}

const PAGE_SIZE = 10

export function NewsArchive() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true)
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, count, error } = await supabase
        .from('news')
        .select('id, title, archive_number, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (!error && data) {
        setItems(data as NewsItem[])
        if (typeof count === 'number') setTotalCount(count)
      }
      setLoading(false)
    }
    fetchPage()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  // Build a compact page list: 1 ... (p-1) p (p+1) ... last
  const buildPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (page > 3) pages.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Arquivo de Notícias</h1>
          <p className={styles.subtitle}>
            Todas as notícias publicadas no CPGG
            {totalCount > 0 && ` — ${totalCount} no total`}
          </p>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>Nenhuma notícia encontrada.</div>
          ) : (
            <>
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

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Paginação de notícias">
                  <button
                    className={styles.pageBtn}
                    onClick={() => goTo(page - 1)}
                    disabled={page === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {buildPageNumbers().map((p, idx) =>
                    p === 'ellipsis' ? (
                      <span key={`e-${idx}`} className={styles.ellipsis}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                        onClick={() => goTo(p)}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className={styles.pageBtn}
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Próxima página"
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
