import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import styles from './pdfviewer.module.css';

const FALLBACK_PDF_URL = '/PDF_history.pdf';

export function HistoryPdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string>(FALLBACK_PDF_URL);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('history_documents')
        .select('pdf_url')
        .eq('slug', 'cpgg-history')
        .maybeSingle();
      if (mounted && data?.pdf_url) setPdfUrl(data.pdf_url);
    })();

    // Block copy / context menu / selection / common shortcuts globally on this page
    const preventDefault = (e: Event) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault();
      }
      // PrintScreen
      if (key === 'printscreen') e.preventDefault();
    };

    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      mounted = false;
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Disable PDF toolbar (download/print buttons) where supported
  const viewerSrc = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>História do CPGG</h1>
        <div
          className={styles.viewerWrapper}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          <iframe
            title="História do CPGG"
            src={viewerSrc}
            className={styles.iframe}
          />
          {/* Transparent overlay blocks right-click and selection over the iframe */}
          <div className={styles.overlay} aria-hidden="true" />
        </div>
        <p className={styles.notice}>
          Este documento é protegido. Cópia, download e impressão estão desabilitados.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default HistoryPdfViewer;
