import styles from './Haroldo.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Haroldo() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="José Haroldo da Silva Sá" />
          <p> José Haroldo da Silva Sá </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="José Haroldo da Silva Sá"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (1975), mestrado em Geologia pela Universidade Federal da Bahia (1980) e doutorado em Geologia pela Universidade Federal da Bahia (1993). Atualmente é professor titular da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Petrologia, atuando principalmente nos seguintes temas: petrologia metamórfica, evolução crustal, geocronologia e geoquímica isotópica."
            belowPhoto={<ResearcherEditButton researcherName="José Haroldo da Silva Sá" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/9442263243312377" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>haroldo@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}