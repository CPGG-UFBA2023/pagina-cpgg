import styles from './Jailma.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Jailma() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Jailma Santos de Souza de Oliveira" />
          <p> Jailma Santos de Souza de Oliveira </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Jailma Santos de Souza de Oliveira"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (1995), mestrado em Geologia pela Universidade Federal da Bahia (1998) e doutorado em Geologia pela Universidade Federal da Bahia (2002). Atualmente é professora associada da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Geologia, atuando principalmente nos seguintes temas: geoquímica, petrologia metamórfica, geocronologia e evolução crustal."
            belowPhoto={<ResearcherEditButton researcherName="Jailma Santos de Souza de Oliveira" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/4320432653750589" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>jailma@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}