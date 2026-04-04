import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { GlobalEarth } from '@/components/GlobalEarth';

const logocpgg = "https://imgur.com/6HRTVzo.png";
const logoufba = "https://imgur.com/x7mquv7.png";

export function Header() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isSamsungA33, setIsSamsungA33] = useState(false);

  // Reset menu state when route changes
  useEffect(() => {
    setOpenMenu(null);
    setOpenSubmenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      // Mobile range: 360px to 430px (includes Samsung S21 Ultra, iPhone 10, Samsung A33)
      setIsSamsungA33(width >= 360 && width <= 430);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMenu = (menu: string) => {
    console.log('toggleMenu', { menu, openMenuBefore: openMenu });
    setOpenMenu((prev) => {
      const next = prev === menu ? null : menu;
      console.log('toggleMenu next', next);
      if (next) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return next;
    });
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (submenu: string) => {
    console.log('toggleSubmenu', { submenu, openSubmenuBefore: openSubmenu });
    setOpenSubmenu((prev) => {
      const next = prev === submenu ? null : submenu;
      console.log('toggleSubmenu next', next);
      return next;
    });
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
    setOpenSubmenu(null);
  };
  return (
    <header className={styles.header}>
      <div className={styles.figure}>
        <img src={logocpgg} alt='CPGG' />
      </div>

      <div className={styles.centerContent}>
        <div className={styles.block1}>
          <h1>{t('header.institutionTitle1')}</h1>
          <h2 className={styles.subTitle}>{t('header.institutionTitle2')}</h2>
          <h2 className={styles.subTitle}>{t('header.institutionTitle3')}</h2>
        </div>
      </div>

      <div className={styles.logoufba}>
        <img src={logoufba} alt='UFBA' />
      </div>

        <div className={styles.languageContainer}>
          <LanguageSelector />
          <NavLink to="/adm" className={styles.admLink}>
            {t('nav.admin')}
          </NavLink>
        </div>
      
      <nav>
        <ul className={styles.signup}>
          <li>
            <NavLink to='/Contact' className={styles.navLink} onClick={closeAllMenus}>
              {t('nav.contact')}
            </NavLink>
          </li>
          <li>
            <NavLink to='/' className={styles.navLink} onClick={closeAllMenus}>
              {t('nav.home')}
            </NavLink>
          </li>
          <li>
            <NavLink to='/sign' className={styles.navLink} onClick={closeAllMenus}>
              {t('nav.signin')}
            </NavLink>
          </li>
          <li
          >
            <a 
              href='#' 
              className={styles.navLink}
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation();
                // CRÍTICO: Verificar largura da tela no momento do clique para mobile
                const currentWidth = window.innerWidth;
                const isMobileWidth = currentWidth >= 360 && currentWidth <= 430;
                
                // Em mobile, SEMPRE navegar para a página, NUNCA abrir menu
                if (isMobileWidth) {
                  setOpenMenu(null);
                  setOpenSubmenu(null);
                  navigate('/sobre-nos');
                  return;
                }
                
                // Para desktop, toggle do menu
                setOpenSubmenu(null);
                setOpenMenu(prev => prev === 'about' ? null : 'about');
              }}
            >
              {t('nav.about')}
            </a>
            
            {/* Só renderizar submenu em desktop (largura > 430px) */}
            {!isSamsungA33 && (
              <div
                className={`${styles.submenu1} ${openMenu === 'about' ? styles.submenu1Open : ''}`}
              >
                <ul>
                  <li className={styles.hoversub}>
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
                    <div
                      className={`${styles.submenu2} ${styles.submenu2Institution} ${openSubmenu === 'institution' ? styles.submenu2Open : ''}`}
                    >
                      <ul>
                        <li>
                          <NavLink to='/cpgg' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.cpgg')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/history' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.history')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Regulations' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.regulations')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Photos' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.photos')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/atas' className={styles.navLink} onClick={closeAllMenus}>
                            Atas
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li className={styles.hoversub}>
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
                    <div
                      className={`${styles.submenu2} ${styles.submenu2Personnel} ${openSubmenu === 'personnel' ? styles.submenu2Open : ''}`}
                    >
                      <ul>
                        <li>
                          <NavLink to='/Coordination' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.coordination')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/researchers' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.researchers')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/senior-researchers' className={styles.navLink} onClick={closeAllMenus}>
                            Pesquisadores Seniores
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to='/Technicians' className={styles.navLink} onClick={closeAllMenus}>
                            {t('nav.technicians')}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <NavLink to='/research-projects' className={styles.navLink} onClick={closeAllMenus}>
                      {t('nav.researchProjects')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/production' className={styles.navLink} onClick={closeAllMenus}>
                      {t('nav.scientificProduction')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/Recipes' className={styles.navLink} onClick={closeAllMenus}>
                      {t('nav.recipes')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/Map' className={styles.navLink} onClick={closeAllMenus}>
                      Map
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}
          </li>
          <li
          >
            <a 
              href='#' 
              className={styles.navLink}
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation();
                // CRÍTICO: Verificar largura da tela no momento do clique para mobile
                const currentWidth = window.innerWidth;
                const isMobileWidth = currentWidth >= 360 && currentWidth <= 430;
                
                // Em mobile, SEMPRE navegar para a página, NUNCA abrir menu
                if (isMobileWidth) {
                  setOpenMenu(null);
                  setOpenSubmenu(null);
                  navigate('/solicitacoes');
                  return;
                }
                
                // Para desktop, toggle do menu
                setOpenSubmenu(null);
                setOpenMenu(prev => prev === 'requests' ? null : 'requests');
              }}
            >
              Solicitações
            </a>
            
            {/* Só renderizar submenu em desktop (largura > 430px) */}
            {!isSamsungA33 && (
              <div
                className={`${styles.submenu1} ${openMenu === 'requests' ? styles.submenu1Open : ''}`}
              >
                <ul className={styles.requestsSubmenu}>
                  <li>
                    <NavLink to='/spaces' className={styles.navLink} onClick={closeAllMenus}>
                      {t('nav.spacesReservations')}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/cpgg2' className={styles.navLink} onClick={closeAllMenus}>
                      Laboratórios e<br />reservas
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/repairs-services' className={styles.navLink} onClick={closeAllMenus}>
                      Reparos e serviços<br />técnicos
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}
          </li>
          <li>
            <NavLink to='/panorama-360' className={styles.navLink} onClick={closeAllMenus}>
              3D
            </NavLink>
          </li>
        </ul>
      </nav>
      <GlobalEarth />
    </header>
  );
}