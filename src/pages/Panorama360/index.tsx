import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import styles from './Panorama360.module.css';

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

  return (
    <div className={styles.pageContainer}>
      <Header />
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
