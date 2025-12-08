import { useEffect } from 'react'
import styles from './former.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

export function Former() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <Header />
      <div className={styles.former}>
        <div className={styles.Headers}>
            <div className={styles.boxzero}>
              <ul>Coordenadores do CPGG</ul>
              <div className={styles.box1}>
                <div className={styles.Header1}>
                  <h1>Prof. Carlos Alberto Dias</h1>
                  <a> (1969 a 1976/ 1980 a 1984)</a>
                  <div className={styles.photobox1}></div>
                </div>
              </div>

              <div className={styles.box2}>
                <div className={styles.Header2}>
                  <h1>Prof. Antônio Expedito</h1>
                  <h1>Gomes de Azevedo</h1>
                  <a>(1976 a 1976)</a>
                  <div className={styles.photobox2}></div>
                </div>
              </div>

              <div className={styles.box3}>
                <div className={styles.Header3}>
                  <h1>Profa. Yeda de Andrade Ferreira</h1>
                  <a>(1976 a 1980)</a>
                  <div className={styles.photobox3}></div>
                </div>
              </div>

              <div className={styles.box4}>
                <div className={styles.Header4}>
                  <h1>Prof. Humberto da Silva Carvalho</h1>
                  <h1>Gomes de Azevedo</h1>
                  <a>(1984 a 1986)</a>
                  <div className={styles.photobox4}></div>
                </div>
              </div>

              <div className={styles.box5}>
                <div className={styles.Header5}>
                  <h1>Prof. Edson Starteri Sampaio</h1>
                  <a> (1986 a 1989)</a>
                  <div className={styles.photobox6}></div>
                </div>
              </div>

              <div className={styles.box6}>
                <div className={styles.Header6}>
                  <h1>Prof. Umberto Raimundo Costa</h1>
                  <h1>Gomes de Azevedo</h1>
                  <a>(1989 a 1990)</a>
                  <div className={styles.photobox5}></div>
                </div>
              </div>

              <div className={styles.box7}>
                <div className={styles.Header7}>
                  <h1>Prof. Olivar Antônio Lima de Lima</h1>
                  <a> (1990 a 1994/ 2002 a 2012)</a>
                  <div className={styles.photobox7}></div>
                </div>
              </div>

              <div className={styles.box8}>
                <div className={styles.Header8}>
                  <h1>Prof. Hédison Kiuity Sato</h1>
                  <a> (2012 a 2018)</a>
                  <div className={styles.photobox8}></div>
                </div>
              </div>

              <div className={styles.box9}>
                <div className={styles.Header9}>
                  <h1>Prof. Marcos Alberto Rodrigues </h1>
                  <h1> Vasconcelos</h1>
                  <a> (2023 a atual)</a>
                  <div className={styles.photobox9}></div>
                </div>
              </div>
            </div>
      </div>
    </div>
    <Footer />
  </>
  )
}
