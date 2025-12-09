import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './Panorama360.module.css';
import headerStyles from '@/components/Header/Header.module.css';

const logocpgg = "https://imgur.com/6HRTVzo.png";
const logoufba = "https://imgur.com/x7mquv7.png";

const PANORAMA_URL = "https://kbxdwrvxrnfkqvpselwz.supabase.co/storage/v1/object/sign/VANT-photos/360.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80YjM3OGVhNS01NDYxLTQwNGItYTcxOS0wNDZmNTljMTY5OGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWQU5ULXBob3Rvcy8zNjAuanBnIiwiaWF0IjoxNzY1MjM4NjQzLCJleHAiOjE3OTY3NzQ2NDN9.U1ZNaC6PP0blmXOrTGoG99mNmZqdafon9Pj29jIDTBk";

export function Panorama360() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let viewer: any = null;

    const initPannellum = async () => {
      try {
        // Dynamically load Pannellum
        const pannellumScript = document.createElement('script');
        pannellumScript.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        
        const pannellumCss = document.createElement('link');
        pannellumCss.rel = 'stylesheet';
        pannellumCss.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        
        document.head.appendChild(pannellumCss);
        
        pannellumScript.onload = () => {
          if (viewerRef.current && (window as any).pannellum) {
            viewer = (window as any).pannellum.viewer(viewerRef.current, {
              type: 'equirectangular',
              panorama: PANORAMA_URL,
              autoLoad: true,
              autoRotate: -2,
              compass: true,
              showZoomCtrl: true,
              showFullscreenCtrl: true,
              mouseZoom: true,
              hfov: 100,
              pitch: 0,
              yaw: 0,
              minHfov: 50,
              maxHfov: 120,
              title: 'CPGG - Vista Aérea 360°',
              author: 'Centro de Pesquisa em Geofísica e Geologia',
            });
            
            viewer.on('load', () => {
              setIsLoading(false);
            });
            
            viewer.on('error', (err: string) => {
              setError('Erro ao carregar imagem panorâmica');
              setIsLoading(false);
            });
          }
        };
        
        pannellumScript.onerror = () => {
          setError('Erro ao carregar biblioteca de visualização');
          setIsLoading(false);
        };
        
        document.body.appendChild(pannellumScript);
      } catch (err) {
        setError('Erro ao inicializar visualizador');
        setIsLoading(false);
      }
    };

    initPannellum();

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  const { t } = useLanguage();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu((prev) => prev === menu ? null : menu);
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (submenu: string) => {
    setOpenSubmenu((prev) => prev === submenu ? null : submenu);
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
    setOpenSubmenu(null);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header sem GlobalEarth */}
      <header className={headerStyles.header}>
        <div className={headerStyles.figure}>
          <img src={logocpgg} alt='CPGG' />
        </div>

        <div className={headerStyles.centerContent}>
          <div className={headerStyles.block1}>
            <h1>{t('header.institutionTitle1')}</h1>
            <h2 className={headerStyles.subTitle}>{t('header.institutionTitle2')}</h2>
            <h2 className={headerStyles.subTitle}>{t('header.institutionTitle3')}</h2>
          </div>
        </div>

        <div className={headerStyles.logoufba}>
          <img src={logoufba} alt='UFBA' />
        </div>

        <div className={headerStyles.languageContainer}>
          <LanguageSelector />
          <a href="/adm" className={headerStyles.admLink}>
            {t('nav.admin')}
          </a>
        </div>
      
        <nav>
          <ul className={headerStyles.signup}>
            <li>
              <NavLink to='/Contact' className={headerStyles.navLink}>
                {t('nav.contact')}
              </NavLink>
            </li>
            <li>
              <NavLink to='/' className={headerStyles.navLink}>
                {t('nav.home')}
              </NavLink>
            </li>
            <li>
              <NavLink to='/sign' className={headerStyles.navLink}>
                {t('nav.signin')}
              </NavLink>
            </li>
            <li>
              <a 
                href='#' 
                className={headerStyles.navLink}
                onClick={(e) => { e.preventDefault(); toggleMenu('about'); }}
              >
                {t('nav.about')}
              </a>
              
              <div className={`${headerStyles.submenu1} ${openMenu === 'about' ? headerStyles.submenu1Open : ''}`}>
                <ul>
                  <li className={headerStyles.hoversub}>
                    <a
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSubmenu('institution');
                      }}
                    >
                      {t('nav.institution')}
                    </a>
                    <div className={`${headerStyles.submenu2} ${headerStyles.submenu2Institution} ${openSubmenu === 'institution' ? headerStyles.submenu2Open : ''}`}>
                      <ul>
                        <li>
                          <NavLink to='/cpgg' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.cpgg')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/history' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.history')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Regulations' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.regulations')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Photos' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.photos')}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li className={headerStyles.hoversub}>
                    <a
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSubmenu('personnel');
                      }}
                    >
                      {t('nav.personnel')}
                    </a>
                    <div className={`${headerStyles.submenu2} ${headerStyles.submenu2Personnel} ${openSubmenu === 'personnel' ? headerStyles.submenu2Open : ''}`}>
                      <ul>
                        <li>
                          <NavLink to='/Coordination' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.coordination')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/researchers' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.researchers')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Technicians' className={headerStyles.navLink} onClick={closeAllMenus}>
                            {t('nav.technicians')}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <NavLink to='/research-projects' className={headerStyles.navLink} onClick={closeAllMenus}>
                      {t('nav.researchProjects')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/production' className={headerStyles.navLink} onClick={closeAllMenus}>
                      {t('nav.scientificProduction')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/Recipes' className={headerStyles.navLink} onClick={closeAllMenus}>
                      {t('nav.recipes')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/Map' className={headerStyles.navLink} onClick={closeAllMenus}>
                      Map
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <a 
                href='#' 
                className={headerStyles.navLink}
                onClick={(e) => { e.preventDefault(); toggleMenu('requests'); }}
              >
                Solicitações
              </a>
              
              <div className={`${headerStyles.submenu1} ${openMenu === 'requests' ? headerStyles.submenu1Open : ''}`}>
                <ul className={headerStyles.requestsSubmenu}>
                  <li>
                    <NavLink to='/spaces' className={headerStyles.navLink} onClick={closeAllMenus}>
                      {t('nav.spacesReservations')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/cpgg2' className={headerStyles.navLink} onClick={closeAllMenus}>
                      {t('nav.labsReservations')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/repairs-services' className={headerStyles.navLink} onClick={closeAllMenus}>
                      Reparos e serviços<br />técnicos
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <NavLink to='/panorama-360' className={headerStyles.navLink}>
                3D
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Vista Aérea 360° do CPGG</h1>
        <p className={styles.subtitle}>
          Arraste para explorar • Use o scroll para zoom • Clique no ícone para tela cheia
        </p>
        
        <div className={styles.viewerContainer}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Carregando panorama 360°...</p>
            </div>
          )}
          
          {error && (
            <div className={styles.errorOverlay}>
              <p>{error}</p>
            </div>
          )}
          
          <div 
            ref={viewerRef} 
            className={styles.panoramaViewer}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
