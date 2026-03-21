import type { MouseEvent } from 'react'
import styles from './Footer.module.css'
import { Linkedin, Instagram } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { VisitorCounter } from '../VisitorCounter'

export function Footer() {
  const { t } = useLanguage();
  const legacyBaseUrl = 'http://www2.cpgg.ufba.br/';

  const openLegacyWindow = (targetUrl: string) => {
    const popup = window.open(
      '',
      'cpgg-legacy-window',
      'popup=yes,width=1280,height=900,left=120,top=80'
    );

    if (!popup) {
      return false;
    }

    const safeTargetUrl = JSON.stringify(targetUrl);

    popup.document.open();
    popup.document.write(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="no-referrer" />
    <title>Abrindo página antiga do CPGG</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: #f4f6f8;
        color: #17212b;
      }

      main {
        width: min(100%, 520px);
        background: #ffffff;
        border-radius: 16px;
        padding: 32px 24px;
        box-shadow: 0 20px 50px rgba(23, 33, 43, 0.14);
        text-align: center;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 1.5rem;
      }

      p {
        margin: 0 0 20px;
        line-height: 1.5;
      }

      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 18px;
        border-radius: 999px;
        background: #17212b;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Abrindo a página antiga do CPGG</h1>
      <p>Se o redirecionamento não acontecer automaticamente, use o botão abaixo.</p>
      <a id="legacy-link" href=${safeTargetUrl}>Abrir página antiga</a>
    </main>

    <script>
      const targetUrl = ${safeTargetUrl};

      try {
        window.opener = null;
      } catch (_) {
      }

      window.location.replace(targetUrl);
    </script>
  </body>
</html>`);
    popup.document.close();
    popup.focus();

    return true;
  };

  const handleLegacyClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const targetUrl = `${legacyBaseUrl}?nocache=${Date.now()}`;
    if (openLegacyWindow(targetUrl)) {
      return;
    }

    const fallbackLink = document.createElement('a');
    fallbackLink.href = targetUrl;
    fallbackLink.target = '_blank';
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
            target="_blank"
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
