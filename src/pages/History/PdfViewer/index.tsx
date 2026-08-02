import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import styles from './pdfviewer.module.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const FALLBACK_PDF_URL = '/PDF_history.pdf';

export function HistoryPdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string>(FALLBACK_PDF_URL);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);

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

    const preventDefault = (e: Event) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'printscreen') e.preventDefault();
    };

    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      mounted = false;
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Render every page of the PDF into canvases (works in every browser)
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setStatus('loading');
    container.innerHTML = '';

    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        if (cancelled) return;

        const width = container.clientWidth || 900;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;

          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(width / base.width, 2);
          const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });

          const canvas = document.createElement('canvas');
          canvas.className = styles.pageCanvas;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${base.width * scale}px`;
          canvas.style.height = `${base.height * scale}px`;

          const context = canvas.getContext('2d');
          if (!context) continue;

          container.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (!cancelled) setStatus('ready');
      } catch (err) {
        console.error('Erro ao carregar o PDF da História:', err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

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
          {status === 'loading' && <p className={styles.state}>Carregando documento…</p>}
          {status === 'error' && (
            <p className={styles.state}>
              Não foi possível exibir o documento.{' '}
              <a href={pdfUrl} target="_blank" rel="noreferrer">Abrir em nova aba</a>
            </p>
          )}
          <div ref={containerRef} className={styles.pages} />
        </div>

        <p className={styles.notice}>
          Este documento é protegido. Cópia, download e impressão estão desabilitados.
        </p>
      </main>
    </div>
  );
}

export default HistoryPdfViewer;
