import styles from './DocumentosSede.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { FileText } from 'lucide-react'
import anexo3 from '@/assets/docs/anexo3.pdf.asset.json'
import anexo4 from '@/assets/docs/anexo4.pdf.asset.json'
import anexo5 from '@/assets/docs/anexo5.pdf.asset.json'
import anexo6 from '@/assets/docs/anexo6.pdf.asset.json'

const DOCS = [
  { url: anexo3.url, titleKey: 'history.docsSede.doc1', descKey: 'history.docsSede.doc1.desc' },
  { url: anexo4.url, titleKey: 'history.docsSede.doc2', descKey: 'history.docsSede.doc2.desc' },
  { url: anexo5.url, titleKey: 'history.docsSede.doc3', descKey: 'history.docsSede.doc3.desc' },
  { url: anexo6.url, titleKey: 'history.docsSede.doc4', descKey: 'history.docsSede.doc4.desc' },
]

export function DocumentosSede() {
  const { t } = useLanguage()

  return (
    <div className={`${styles.pageContainer} cpgg-page-container`}>
      <Header />
      <main className={`${styles.docs} cpgg`}>
        <div className={styles.box}>
          <h1 className={styles.heading}>{t('history.docsSedeTitle')}</h1>
          <div className={styles.list}>
            {DOCS.map((doc) => (
              <a
                key={doc.url}
                className={styles.docCard}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <h2>{t(doc.titleKey)}</h2>
                  <p>{t(doc.descKey)}</p>
                </div>
              </a>
            ))}
          </div>
          <Link className={styles.backLink} to="/history" style={{ color: '#592cbb' }}>
            {t('button.back')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
