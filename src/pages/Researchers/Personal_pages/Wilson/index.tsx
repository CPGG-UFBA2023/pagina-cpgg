import styles from './Wilson.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Wilson() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Wilson Mouzer Figueiró" />
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}><span>Wilson Mouzer Figueiró</span><ResearcherEditButton researcherName="Wilson Mouzer Figueiró" inline /></p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Wilson Mouzer Figueiró"
            staticDescription="Possui Graduação em Matemática pela Universidade Federal do Rio de Janeiro (1983) e Doutorado em Geofísica pela UFBA, Universidade Federal da Bahia, (1994). Realizou Pesquisa a nível de Pós-Doutorado no Departamento Terra-Atmosfera-Oceano da Escola Normal Superior de Paris na França (1997-1999). Atualmente é Professor Associado da UFBA e Pesquisador do Centro de Pesquisa em Geofísica e Geologia da UFBA. Tem experiência na área de Geociências, com ênfase em Inversão Geofísica, atuando principalmente nos seguintes temas: Inversão Sísmica, Modelagem Sísmica, Traçamento de Raios Sísmicos, e Matemática Aplicada à Geofísica."
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="https://lattes.cnpq.br/4503597230743925" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>figueiro6@gmail.com</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}