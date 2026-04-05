import styles from './Ruy.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Ruy() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Ruy Kenji Papa de Kikuchi" />
          <p> Ruy Kenji Papa de Kikuchi </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Ruy Kenji Papa de Kikuchi"
            staticDescription="Professor Titular aposentado do Instituto de Geociências da Universidade Federal da Bahia. Possui graduação em Geologia pela Universidade Federal da Bahia (1978), mestrado em Geologia pela Universidade Federal da Bahia (1982) e doutorado em Geologia Marinha pela Universidade de São Paulo (1989). Tem experiência na área de Geociências, com ênfase em Geologia e Geoquímica Marinha, atuando principalmente nos seguintes temas: geoquímica dos sedimentos, sedimentologia, oceanografia geológica, recifes de coral e corais."
            belowPhoto={<ResearcherEditButton researcherName="Ruy Kenji Papa de Kikuchi" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/8391627429679768" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>ruy@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}