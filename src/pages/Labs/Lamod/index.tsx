import { Link } from 'react-router-dom'
import styles from './lamod.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import lamodPhoto1 from '../../../assets/lamod-photo1.png'
import { LabPhotosEditor, useLabPhotos } from '@/components/LabPhotosEditor'

export function Lamod() {
  const { photos, refetch } = useLabPhotos('LAMOD')
  return (
    <div className={styles.pageContainer}>
      <Header />
      <LabPhotosEditor
        acronym="LAMOD"
        onSaved={refetch}
        slots={[{ index: 1, label: 'Mesa de Deformação NSB 2018' }]}
      />
      <div className={styles.lamod}>
        <div className={styles.Title}>
          <div className={styles.box}>
            <div className={styles.photoGrid}>
              <div
                className={styles.photoBox1}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(2,0,36,0.05) 0%, rgba(63,9,121,0.35) 100%), url(${photos.photo1_url || lamodPhoto1})` }}
              >
                <h4 className={styles.legend1}>{photos.photo1_legend || 'Mesa de Deformação NSB 2018'}</h4>
              </div>
            </div>
            <div className={styles.content}>
              <ul>LAMOD</ul>
              <a className={styles.subtitle}>Laboratório de Modelagem Física</a>
              <p>
                O LAMOD, localizado no prédio do Centro de Pesquisa em Geofísica e Geologia (CPGG) do Instituto de Geociências da UFBA, é um laboratório multiusuário dedicado à modelagem física de estruturas geológicas, ocupando uma área climatizada de 40 m². Inaugurado com recursos dos projetos Rift Bahia I e II em parceria com a Petrobras S/A entre 2015 e 2018, o espaço foi projetado para ser o mais moderno do gênero no Brasil. Sua infraestrutura inclui uma área administrativa situada em um mezanino e uma área de experimentos no andar térreo.
              </p>
              <p>
                O laboratório conta com A Mesa de Deformação NSB 2018, única no mundo em seu design e capacidade, permitindo a coleta de um volume significativo de dados experimentais. Para isso, o LAMOD dispõe de sete computadores de mesa e dois notebooks acoplados ao sistema. Sua concepção contou com visitas técnicas do coordenador, Prof. Dr. Luiz Cesar Correa Gomes, a renomados laboratórios do Brasil, como os da UFOP, UFRN e CENPES-RJ, além do Royal Holloway na Universidade de Londres.
              </p>
              <p>
                Além da mesa simuladora, que permite a modelagem de estruturas geológicas em ambientes contracionais (p.ex. falhas reversas, cinturões de dobras e falhas), dilatacionais (p.ex. falhas normais e bacias tipo rifte) e transcorrentes (p.ex. falhas strike-slip, falhas transformantes e transferentes) o LAMOD pode ir além. Outros equipamentos do LAMOD podem permitir fazer simulações de crateras de impacto de meteoritos (metálicos e rochosos), estruturas de colapso tipo sinkholes em ambientes siliciclásticos e cársticos, estruturas de uplift-domeamento litosférico, ligadas a plumas térmicas mantélicas e zonas de subdução e colisão. Além de outros experimentos que poderão ser apresentados pelos usuários interessados.
              </p>
              <p>
                Todos esses experimentos serão ser discutidos com os usuários de modo que os mesmos possam: i) colaborar na organização/construção dos artefatos de simulação (estruturas especificas tais como rampas e patamares retilíneos ou curvos, lineares ou irregulares em perfil e em planta), ii) participar da preparação e execução dos experimentos, e iii) saber quais materiais e em quais quantidades serão utilizados nos experimentos. Todos os materiais utilizados nos experimentos ficarão a cargo dos usuários. Esses experimentos deverão ser comparados com os seus similares observados na natureza para validação dos modelos obtidos nas modelagens.
              </p>

              <b className={styles.purpleText}>Coordenador:</b>
              <span>Prof. Luiz Cesar Correa Gomes</span>
              <span className={styles.emailLine}>
                <a href="mailto:lccgomes@ufba.br" className={styles.purpleLink}>lccgomes@ufba.br</a>
              </span>

              <p>
                Acesse o site da Plataforma Nacional de Infraestrutura de Pesquisa-PNIPE:
                <br />
                <a
                  href="https://pnipe.mcti.gov.br/laboratory/19338"
                  target="_blank"
                  className={styles.purpleLink}
                >
                  Site do PNIPE
                </a>
              </p>

              <p>
                Acesse o site do LAMOD:
                <br />
                <a
                  href="https://lamodigeoufba.webnode.page/"
                  target="_blank"
                  className={styles.purpleLink}
                >
                  Site do LAMOD
                </a>
              </p>

              <div className={styles.requerimentoButton}>
                <Link to="/labs/lamod/reservation-form" className={styles.buttonLink}>
                  Requerimento
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
