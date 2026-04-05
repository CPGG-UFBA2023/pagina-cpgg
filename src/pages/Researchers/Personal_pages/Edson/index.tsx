import styles from './Edson.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Edson() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Edson Emanuel Starteri Sampaio" />
          <p> Edson Emanuel Starteri Sampaio </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Edson Emanuel Starteri Sampaio"
            staticDescription="Possui graduação em Geologia pela Universidade Federal da Bahia (2006), mestrado em Geologia pela Universidade Federal da Bahia (2009) e doutorado em Geologia pela Universidade Federal da Bahia (2014). Atualmente é professor adjunto da Universidade Federal da Bahia. Tem experiência na área de Geociências, com ênfase em Petrologia, Metalogênese e Exploração Mineral, atuando principalmente nos seguintes temas: petrogênese, geocronologia, geoquímica isotópica e geologia estrutural."
            belowPhoto={<ResearcherEditButton researcherName="Edson Emanuel Starteri Sampaio" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/2916849932837997" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>edson@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}