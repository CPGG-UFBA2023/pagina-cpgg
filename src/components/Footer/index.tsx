import type { MouseEvent } from 'react'
import styles from './Footer.module.css'
import { Linkedin, Instagram } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { VisitorCounter } from '../VisitorCounter'

export function Footer() {
  const { t } = useLanguage();
  const legacyBaseUrl = 'http://www2.cpgg.ufba.br/';

  const handleLegacyClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const targetUrl = `${legacyBaseUrl}?nocache=${Date.now()}`;
    const openedWindow = window.open(
      '',
      'cpgg-legacy-window',
      'popup=yes,width=1280,height=900,left=120,top=80'
    );

    if (openedWindow) {
      try {
        openedWindow.opener = null;
      } catch (_) {
        // Ignora navegadores que bloqueiam essa atribuição
      }

      try {
        openedWindow.location.replace(targetUrl);
      } catch (_) {
        openedWindow.location.href = targetUrl;
      }

      openedWindow.focus();
      return;
    }

    const fallbackLink = document.createElement('a');
    fallbackLink.href = targetUrl;
    fallbackLink.target = 'cpgg-legacy-window';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.referrerPolicy = 'no-referrer';
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  };
  
  return (
    <footer className={styles.footer}>
      <div className={styles.image} />
      <div className={styles.bar}>
        <VisitorCounter />
        <nav>
          <a
            href={legacyBaseUrl}
            target="cpgg-legacy-window"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            onClick={handleLegacyClick}
          >{t('footer.oldPage')}</a>
          
          <a href='https://www.linkedin.com/in/cpgg-centro-de-pesquisa-94768a304/' target="_blank" className={styles.socialLink} rel="noopener noreferrer">
            <Linkedin size={16} />
            {t('footer.linkedin')}
          </a>
          <a
            href='https://instagram.com/cpgg.ufba/'
            target="_blank"
            rel="external noopener noreferrer"
            referrerPolicy="no-referrer"
            className={styles.socialLink}
            aria-label="Instagram do CPGG"
            title="Instagram do CPGG"
            onClick={(e) => {
              e.preventDefault();
              const url = 'https://instagram.com/cpgg.ufba/';
              const w = window.open(url, '_blank');
              if (!w) {
                try {
                  // Tenta navegar a janela principal (fora do iframe) por ativação do usuário
                  // Alguns ambientes de preview bloqueiam a navegação dentro do iframe
                  // isso evita o erro de conexão recusada no iframe
                  // @ts-ignore - window.top pode ser cross-origin
                  window.top.location.href = url;
                } catch (_) {
                  window.location.href = url;
                }
              }
            }}
          >
            <Instagram size={16} />
            {t('footer.instagram')}
          </a>
          <a href='http://www.pggeofisica.ufba.br/' target="_blank">{t('footer.postGradGeophysics')}</a>
          <a href='https://pggeologia.ufba.br/' target="_blank" >{t('footer.postGradGeology')}</a>
          <a href='https://posufba-geofexpmineral.com.br/' target="_blank" rel="noopener noreferrer">Curso de Especialização</a>
        </nav>
        <div className={styles.copyright}>
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
