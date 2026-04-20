import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './History.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import earth from '../../components/Figures/earth-new.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminLogin } from '../Atas/components/AdminLogin';
import { HistoryPdfUpload } from './components/HistoryPdfUpload';
import { Button } from '@/components/ui/button';
import { Lock, LogOut } from 'lucide-react';

const FALLBACK_PDF_URL = 'https://raw.githubusercontent.com/CPGG-UFBA/Documentos_WEB_CPGG/main/PDF_history.pdf';

export function History() {
  const { t } = useLanguage();
  const [pdfUrl, setPdfUrl] = useState<string>(FALLBACK_PDF_URL);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPdf = async () => {
      const { data } = await supabase
        .from('history_documents')
        .select('pdf_url')
        .eq('slug', 'cpgg-history')
        .maybeSingle();
      if (mounted && data?.pdf_url) setPdfUrl(data.pdf_url);
    };

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) setIsAdmin(false); return; }
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'coordenacao')
        .maybeSingle();
      if (mounted) setIsAdmin(!!data);
    };

    loadPdf();
    checkAdmin();

    const { data: sub } = supabase.auth.onAuthStateChange(() => checkAdmin());
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={`${styles.history} history`}>
        <h1 className={styles.title}>{t('history.title')}</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/history/Former">
            <div className={styles.headers}>
              <h2>{t('history.coordinators')}</h2>
            </div>
          </Link>

          <a className={styles.card} href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <div className={styles.document}>
              <h2>{t('history.cpggHistory')}</h2>
            </div>
          </a>
        </div>
      </main>

      {!isAdmin ? (
        <Button
          size="sm"
          onClick={() => setShowLogin(true)}
          style={{
            position: 'fixed', top: '170px', right: '20px', zIndex: 100,
            backgroundColor: '#592cbb', color: 'white',
          }}
        >
          <Lock className="w-4 h-4 mr-2" />
          Editar
        </Button>
      ) : (
        <>
          <HistoryPdfUpload onUpdated={(url) => setPdfUrl(url)} />
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            style={{ position: 'fixed', top: '215px', right: '20px', zIndex: 100 }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </>
      )}

      <AdminLogin
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setIsAdmin(true)}
      />

      <div className={styles.staticFigure}>
        <img src={earth} alt="Terra" className={styles.earthImage} />
      </div>

      <Footer />
    </div>
  );
}
