import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Header.module.css";
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { GlobalEarth } from '@/components/GlobalEarth';

const logocpgg = "https://imgur.com/6HRTVzo.png";
const logoufba = "https://imgur.com/x7mquv7.png";

export function Header() {
  const { t } = useLanguage();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
        <a href="/adm" className={styles.admLink}>
          {t('nav.admin')}
        </a>
      </div>
      
      <nav>
        <ul className={styles.signup}>
          <li>
            <NavLink to='/Contact' className={styles.navLink}>
              {t('nav.contact')}
            </NavLink>
          </li>
          <li>
            <NavLink to='/' className={styles.navLink}>
              {t('nav.home')}
            </NavLink>
          </li>
          <li>
            <NavLink to='/sign' className={styles.navLink}>
              {t('nav.signin')}
            </NavLink>
          </li>
          <li
          >
            <a 
              href='#' 
              className={styles.navLink}
              onClick={(e) => { e.preventDefault(); toggleMenu('about'); }}
            >
              {t('nav.about')}
            </a>
            
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
          </li>
          <li
          >
            <a 
              href='#' 
              className={styles.navLink}
              onClick={(e) => { e.preventDefault(); toggleMenu('requests'); }}
            >
              Solicitações
            </a>
            
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
                    {t('nav.labsReservations')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to='/repairs-services' className={styles.navLink} onClick={closeAllMenus}>
                    Reparos e serviços técnicos
                  </NavLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
      <GlobalEarth />
    </header>
  );
}