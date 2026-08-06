import { useState, useEffect } from 'react';
import styles from '../Laiga/laiga.module.css';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Laboratory {
  id: string;
  name: string;
  acronym: string;
  chief_name: string;
  description: string | null;
  pnipe_address: string | null;
  photo1_url: string | null;
  photo2_url: string | null;
  photo3_url: string | null;
  photo1_legend: string | null;
  photo2_legend: string | null;
  photo3_legend: string | null;
}

export function DynamicLab() {
  const { t } = useLanguage();
  const { acronym } = useParams<{ acronym: string }>();
  const navigate = useNavigate();
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaboratory = async () => {
      if (!acronym) return;

      try {
        const { data, error } = await supabase
          .from('laboratories')
          .select('*')
          .ilike('acronym', acronym)
          .single();

        if (error) throw error;
        setLaboratory(data);
      } catch (error) {
        console.error('Erro ao buscar laboratório:', error);
        navigate('/spaces');
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratory();
  }, [acronym, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.laiga}>
          <div className={styles.Title}>
            <ul>Carregando...</ul>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!laboratory) {
    return null;
  }

  return (
    <>
      <Header />
      <div className={styles.laiga}>
        <div className={styles.Title}>
          <ul>{laboratory.name}</ul>
          <a>{laboratory.acronym}</a>
          <div className={styles.box}>
            {laboratory.description && (
              <>
                <p style={{ whiteSpace: 'pre-line' }}>{laboratory.description}</p>
                <br />
              </>
            )}
            
            <p>
              Acesse o site da Plataforma Nacional de Infraestrutura de Pesquisa-PNIPE, 
              e veja as fotos e mais detalhes sobre os equipamentos disponíveis.
            </p>

            {laboratory.pnipe_address && (
              <nav>
                <a 
                  href={laboratory.pnipe_address} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.purpleLink}
                >
                  {t('laiga.pnipeSite')}
                </a>
              </nav>
            )}

            <p>
              Para saber da disponibilidade dos equipamentos e solicitá-los para uso, 
              acesse nossa plataforma de requerimento.
            </p>
            <br />
            
            <b className={styles.purpleText}>
              Coordenador do {laboratory.name}
            </b>
            <span>{laboratory.chief_name}</span>

            <div className={styles.requerimentoButton}>
              <a href="/labs/laiga/reservation-form" className={styles.buttonLink}>
                {t('laiga.requestButton')}
              </a>
            </div>

            {laboratory.photo1_url && (
              <div 
                className={styles.box1}
                style={{
                  background: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${laboratory.photo1_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <h4 className={styles.legend1}>{laboratory.photo1_legend || ''}</h4>
              </div>
            )}
            
            {laboratory.photo2_url && (
              <div 
                className={styles.box2}
                style={{
                  background: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${laboratory.photo2_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <h4 className={styles.legend2}>{laboratory.photo2_legend || ''}</h4>
              </div>
            )}
            
            {laboratory.photo3_url && (
              <div 
                className={styles.box3}
                style={{
                  background: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${laboratory.photo3_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <h4 className={styles.legend3}>{laboratory.photo3_legend || ''}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
