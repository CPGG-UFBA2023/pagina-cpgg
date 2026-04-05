import styles from './Johildo.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Johildo() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Johildo Salomão Figuerêdo Barbosa" />
          <p> Johildo Salomão Figuerêdo Barbosa </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Johildo Salomão Figuerêdo Barbosa"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (1977), mestrado em Geologia pela Universidade Federal da Bahia (1982) e doutorado em Geologia pela Universidade Federal da Bahia (1990). Atualmente é professor titular da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Geologia Estrutural e Tectônica, atuando principalmente nos seguintes temas: evolução crustal, metamorfismo, tectônica e geologia precambriana."
            belowPhoto={<ResearcherEditButton researcherName="Johildo Salomão Figuerêdo Barbosa" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/1670809981583072" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>johildo@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}