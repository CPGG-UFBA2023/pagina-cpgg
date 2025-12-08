import styles from './LRogerio.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function LRogerio() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Luiz Rogério Bastos Leal </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Luiz Rogério Bastos Leal"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (1986), mestrado em Geoquímica pela Universidade Federal Fluminense (1990) e doutorado em Geoquímica pela Universidade Federal Fluminense (1995). Atualmente é professor titular da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Geoquímica e Geocronologia, atuando principalmente nos seguintes temas: geoquímica isotópica, geocronologia, evolução crustal e recursos hídricos."
            belowPhoto={<ResearcherEditButton researcherName="Luiz Rogério Bastos Leal" inline />}
          />
            <nav>
             <a href="https://lattes.cnpq.br/1234567890123456" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>lrogerio@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}