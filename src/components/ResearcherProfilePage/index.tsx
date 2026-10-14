import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, ExternalLink } from 'lucide-react'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { ResearcherEditButton } from '../ResearcherEditButton'
import { ResearcherProfileProvider } from '../ResearcherProfileContext'
import { supabase } from '@/integrations/supabase/client'
import { getResearcherPhoto } from '@/data/researcher-photos'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './ResearcherProfilePage.module.css'

interface Props {
  name: string
  description?: string
  email?: string | null
  lattes?: string | null
  staticPhotoUrl?: string
}

const isRealEmail = (e?: string | null) =>
  !!e && e.includes('@') && !/provisorio|temporario|aguardando|a_definir|a-definir|xxxx/i.test(e)

const initials = (name: string) =>
  name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export function ResearcherProfilePage({ name, description = '', email, lattes, staticPhotoUrl }: Props) {
  const { t, language } = useLanguage()
  const [profile, setProfile] = useState<{ description?: string | null; photo_url?: string | null; email?: string | null } | null>(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    supabase
      .from('user_profiles')
      .select('description, photo_url, email')
      .ilike('full_name', name.trim())
      .limit(1)
      .then(({ data }) => { if (active) setProfile(data?.[0] ?? null) })
    return () => { active = false }
  }, [name, refresh])

  const text = profile?.description?.trim() || description
  const shownEmail = isRealEmail(profile?.email) ? profile!.email : isRealEmail(email) ? email : null
  const photo = profile?.photo_url || staticPhotoUrl || getResearcherPhoto(name) || null
  const [photoFailed, setPhotoFailed] = useState(false)
  const en = language === 'en'

  return (
    <div className={`${styles.page} cpgg-page-container`}>
      <Header />
      <main className={`${styles.main} cpgg`}>
        <div className={styles.shell}>
          <Link to="/researchers" className={styles.back}>
            <ArrowLeft size={16} /> {t('button.back')}
          </Link>

          <section className={styles.hero}>
            <div className={styles.portrait}>
              {photo && !photoFailed ? (
                <img src={photo} alt={name} onError={() => setPhotoFailed(true)} />
              ) : (
                <span>{initials(name)}</span>
              )}
            </div>
            <div className={styles.identity}>
              <span className={styles.eyebrow}>{en ? 'CPGG Researcher' : 'Pesquisador(a) do CPGG'}</span>
              <h1 className={styles.name}>
                {name}
                <ResearcherProfileProvider value={{ staticDescription: description }}>
                  <ResearcherEditButton researcherName={name} inline staticDescription={description} onSave={() => setRefresh((r) => r + 1)} />
                </ResearcherProfileProvider>
              </h1>
              <div className={styles.actions}>
                {shownEmail && (
                  <a className={styles.pill} href={`mailto:${shownEmail}`}>
                    <Mail size={16} /> {shownEmail}
                  </a>
                )}
                {lattes && (
                  <a className={`${styles.pill} ${styles.pillPrimary}`} href={lattes} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} /> {en ? 'Lattes CV' : 'Currículo Lattes'}
                  </a>
                )}
              </div>
            </div>
          </section>

          <section className={styles.about}>
            <h2>{en ? 'About' : 'Sobre'}</h2>
            <p className="researcher-description">{text || (en ? 'Description not available.' : 'Descrição não disponível.')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
