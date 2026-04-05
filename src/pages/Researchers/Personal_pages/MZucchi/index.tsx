import styles from './MZucchi.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function MZucchi() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Maria do Rosário Zucchi" />
          <p> Maria do Rosário Zucchi </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Maria do Rosário Zucchi"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (1982), mestrado em Geologia pela Universidade Federal da Bahia (1986) e doutorado em Geologia pela Universidade Federal da Bahia (1993). Atualmente é professora associada da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Recursos Hídricos e Ambientais, atuando principalmente nos seguintes temas: hidrogeologia, geologia ambiental, geofísica aplicada e gestão de recursos naturais."
            belowPhoto={<ResearcherEditButton researcherName="Maria do Rosário Zucchi" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/8882959656170754" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>mzucchi@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}