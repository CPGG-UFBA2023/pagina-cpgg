import { Link } from 'react-router-dom'
import styles from './lemar.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import lemarPhoto1 from '../../../assets/lemar-photo1.jpeg'
import lemarPhoto2 from '../../../assets/lemar-photo2.jpeg'
import lemarPhoto3 from '../../../assets/lemar-photo3.jpeg'

export function Lemar() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.laiga}>
        <div className={styles.Title} >
          <div className={styles.box}>
          <ul>LEMAR</ul>
          <a>Laboratório de Espectrometria de Massas de Alta Resolução</a>
            <p>
              O laboratório espectrometria de massas do Instituto de Geociências da UFBA é equipado com um Element™ XR High-resolution ICP-MS da ThermoFisher Scientific®, dotado de fonte de plasma e analisador do tipo monocoletor (sistema monocoletor SF). O equipamento permite análises de elementos traço em materiais geológicos em concentrações da ordem de mg/L a sub-pg/L.
            </p>
            <br></br>
            <p>
              O pacote analítico inclui elementos terras-raras, outros elementos traço (Rb, Sr, Ba, Cs, Zr, Nb, Ta, Y, Pb, Th e U) e isotopia U/Pb em zircão.
            </p>
            <br></br>
            <p>
              As análises podem ser realizadas em rochas, minerais e solos após digestão ácida em forno microondas para abertura das amostras. O sistema de ablação à laser acoplado ao equipamento (LA-ICP-MS) permite também a realização de análises in situ em materiais sólidos.
            </p>
            <br></br>
            <p>
              Para a realização das análises, solicitamos que as amostras sejam enviadas em granulometria inferior à 200 mesh. Caso deseje, o Laboratório de Preparação de Amostras do IGEO-UFBA encontra-se à disposição. O usuário pode solicitar os serviços deste laboratório entrando em contato com o coordenador Prof. Dr. Jailson Junior Alves Santos através do e-mail <a href="mailto:jailsonjas@ufba.br" className={styles.purpleLink}>jailsonjas@ufba.br</a>.
            </p>
            <br></br>
            <p>
              Os valores para as análises variam de acordo com a categoria do usuário conforme indicado a seguir: Comunidade acadêmica (usuários vinculados à UFBA ou à outras universidades públicas) - R$ 270,00 por amostra. Comunidade externa - Instituições Públicas - R$ 330,00 por amostra. Comunidade externa (usuários não vinculados à universidades ou instituições públicas) - R$ 540,00 por amostra.
            </p>
            <br></br>

           <b className={styles.purpleText}>Chefe:</b>
           <span>Prof. Dr. Eduardo Reis Viana Rocha Júnior</span>
           <span style={{ fontSize: '64%' }}><a href="mailto:eduardo.junior@ufba.br" className={styles.purpleLink}>eduardo.junior@ufba.br</a></span>
           <br />
           <b className={styles.purpleText}>Vice-Chefe:</b>
           <span>Profa. Dra. Letícia Freitas Guimarães</span>
           <span style={{ fontSize: '64%' }}><a href="mailto:guimaraesleticia@ufba.br" className={styles.purpleLink}>guimaraesleticia@ufba.br</a></span>

            <div className={styles.photoBox1} style={{ backgroundImage: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${lemarPhoto1})` }}></div>
            <div className={styles.photoBox2} style={{ backgroundImage: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${lemarPhoto2})` }}></div>
            <div className={styles.photoBox3} style={{ backgroundImage: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${lemarPhoto3})` }}></div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
