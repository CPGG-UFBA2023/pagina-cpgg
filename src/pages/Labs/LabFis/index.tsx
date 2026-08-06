import styles from '../Lemar/lemar.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import labfis1 from '../../../assets/labfis1.jpg.asset.json'
import labfis2 from '../../../assets/labfis2.jpg.asset.json'
import labfis3 from '../../../assets/labfis3.jpg.asset.json'
import { LabPhotosEditor, useLabPhotos } from '@/components/LabPhotosEditor'

const LEGEND1 = 'Sala do Laboratório de Propriedades Físicas das Rochas'
const LEGEND2 = 'Estação Eletroquímica ZAHNER, modelo IM6'
const LEGEND3 = 'Esquema da Estação de Permeametria Transiente'
const GRAD = 'linear-gradient(180deg, rgba(2,0,36,0.05) 0%, rgba(63,9,121,0.35) 100%)'

export function LabFis() {
  const { photos, refetch } = useLabPhotos('LabFis')

  return (
    <div className={styles.pageContainer}>
      <Header />
      <LabPhotosEditor
        acronym="LabFis"
        onSaved={refetch}
        slots={[
          { index: 1, label: 'Foto 1', currentLegend: LEGEND1 },
          { index: 2, label: 'Foto 2', currentLegend: LEGEND2 },
          { index: 3, label: 'Foto 3', currentLegend: LEGEND3 },
        ]}
      />
      <div className={styles.laiga}>
        <div className={styles.Title}>
          <div className={styles.box}>
            <div className={styles.photoGrid}>
              <div
                className={styles.photoBox1}
                style={{ backgroundImage: `${GRAD}, url(${photos.photo1_url || labfis1.url})` }}
              >
                <h4 className={styles.legend}>{photos.photo1_legend || LEGEND1}</h4>
              </div>
              <div
                className={styles.photoBox2}
                style={{ backgroundImage: `${GRAD}, url(${photos.photo2_url || labfis2.url})` }}
              >
                <h4 className={styles.legend}>{photos.photo2_legend || LEGEND2}</h4>
              </div>
              <div
                className={styles.photoBox3}
                style={{ backgroundImage: `${GRAD}, url(${photos.photo3_url || labfis3.url})` }}
              >
                <h4 className={styles.legend}>{photos.photo3_legend || LEGEND3}</h4>
              </div>
            </div>
            <div className={styles.content}>
              <ul>LabFis</ul>
              <a className={styles.subtitle}>Laboratório de Propriedades Físicas das Rochas</a>

              <b className={styles.purpleText}>Histórico</b>
              <p>
                O Laboratório de Propriedades Físicas das Rochas do CPGG/UFBA teve sua montagem
                iniciada em 1999 com apoio do convênio UFBA/CPRM-CERB. Posteriormente, foi apoiado
                com recursos da FINEP, do CENPES/PETROBRAS e do CNPq/CT-PETRO que financiaram e
                financiam os seguintes projetos: (i) Heterogeneidades petrofísicas dos arenitos
                reservatórios na Formação Sergi; (ii) Desenvolvimento de metodologia para a obtenção
                de permeabilidade efetiva a partir de dados geofísicos em reservatórios de
                baixíssima permeabilidade; e (iii) Avaliação da resposta eletromagnética de
                reservatórios de petróleo submetidos a injeção forçada de fluidos.
              </p>
              <p>
                Este laboratório encontra-se instalado e dispõe de sistemas para preparo de
                amostras, equipamentos para determinações precisas de porosidade, permeabilidade
                hidráulica, condutividade e permissividade elétrica como funções de frequência, além
                de ressonância nuclear magnética.
              </p>

              <b className={styles.purpleText}>Equipamentos</b>
              <p>
                <strong>Estação de Ressonância Nuclear Magnética Resonance, mod. Maran-Ultra 2 MHz</strong>{' '}
                — Sistema de RNM para análise de rochas de até 40 mm de diâmetro, baseada em magneto
                permanente. Controlada por microcomputador, permite medir tempos de relaxação T1 e
                T2 e tem opção de gradiente para experimentos de difusão.
              </p>
              <p>
                <strong>Estação Eletroquímica ZAHNER, modelo IM6</strong> — É operada e controlada
                por um microcomputador e usada para medir espectroscopia de impedância elétrica
                (condutividade elétrica e permissividade dielétrica) no intervalo de frequência de
                10⁻² Hz a 10⁶ Hz, potencial espontâneo e coeficientes de acoplamento eletro-cinético
                e eletro-osmótico de amostras de rochas reservatórios. O sistema utiliza vários
                porta-amostras em acrílico, com eletrodos especiais de prata para as medidas.
              </p>
              <p>
                <strong>Estação de Permeametria Transiente</strong> — Montada na instituição com
                célula triaxial de baixa pressão (até 2,0 MPa), que pode ser substituída por
                porta-amostras TEMCO de alta pressão, bombas seringas KDS210, bombas de pressão e
                transdutores de pressão de 100, 300 e 1000 kPa, para medir permeabilidade com alta
                precisão, no intervalo de alguns Darcys até 0,0001 mD. Também totalmente
                automatizada e controlada por microcomputador.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
