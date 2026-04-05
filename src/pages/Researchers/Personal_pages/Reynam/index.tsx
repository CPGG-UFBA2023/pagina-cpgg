import styles from './Reynam.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Reynam() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Reynam da Cruz Pestana" />
          <p> Reynam da Cruz Pestana </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Reynam da Cruz Pestana"
            staticDescription="Possui graduação em Geofísica pela Universidade Federal da Bahia (1987), mestrado em Geofísica pela Universidade Federal da Bahia (1994) e doutorado em Geofísica pela Universidade Federal da Bahia (2000). Atualmente é professor associado da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Geofísica, atuando principalmente nos seguintes temas: processamento sísmico, migração sísmica, inversão geofísica e exploração petrolífera."
            belowPhoto={<ResearcherEditButton researcherName="Reynam da Cruz Pestana" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/7927685281122435" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>reynam@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}