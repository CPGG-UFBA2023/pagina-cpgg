import { NavLink } from 'react-router-dom'
import { HomeButton } from '../../components/HomeButton'
import styles from './adm.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect } from 'react'
import { useAccessPermissions } from '@/hooks/useAccessPermissions'
import { hasAnyPermission } from '@/lib/accessPermissions'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'
const logocpgg = 'https://i.imgur.com/6HRTVzo.png';

export function Adm() {
  const { t } = useLanguage();
  const { permissions } = useAccessPermissions();

  useEffect(() => {
    // Sobrescrever background do body
    document.body.style.backgroundImage = 'url("https://i.imgur.com/ZwnmRF6.png")'
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundRepeat = 'no-repeat'
    
    // Forçar remoção de scroll
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    document.body.style.maxHeight = '100vh'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100vh'
    document.documentElement.style.maxHeight = '100vh'

    return () => {
      // Restaurar background original ao sair
      document.body.style.backgroundImage = 'url("https://imgur.com/zBzhTLu")'
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundAttachment = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.maxHeight = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.documentElement.style.maxHeight = ''
    }
  }, [])
  
  return (
    <div className={styles.adm} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      height: '100vh',
      width: '100vw'
    }}>
      <HomeButton />
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        <div className={styles.title}>
          <h1>{t('adm.title')}</h1>
          <p>{t('adm.subtitle')}</p>
        </div>
        
        <div className={styles.optionsContainer}>
          {hasAnyPermission(permissions) && <Button asChild variant="outline"><NavLink to="/adm/painel">Painel administrativo</NavLink></Button>}
          {permissions.access && <Button asChild><NavLink to="/adm/acessos"><ShieldCheck size={18} className="mr-2" />Acessos e privilégios</NavLink></Button>}
          <div className={styles.topRow}>
            <NavLink to="/adm/ti" className={styles.optionCard}>
              <div className={styles.cardContent}>
                <h2>{t('adm.ti')}</h2>
                <p>{t('adm.tiAccess')}</p>
              </div>
            </NavLink>
            
            <NavLink to="/adm/secretaria" className={styles.optionCard}>
              <div className={styles.cardContent}>
                <h2>{t('adm.secretary')}</h2>
                <p>{t('adm.secretaryAccess')}</p>
              </div>
            </NavLink>
          </div>
          
          <div className={styles.bottomRow}>
            <NavLink to="/adm/coordenacao" className={styles.optionCard}>
              <div className={styles.cardContent}>
                <h2>{t('adm.coordination')}</h2>
                <p>{t('adm.coordinationAccess')}</p>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}