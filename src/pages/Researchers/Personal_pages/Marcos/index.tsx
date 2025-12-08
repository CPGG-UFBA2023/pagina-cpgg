import styles from './Marcos.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Marcos() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Marcos Alberto Rodrigues Vasconcelos </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Marcos Alberto Rodrigues Vasconcelos"
            staticDescription="é geólogo pela Universidade de Brasília (2005), possui mestrado em Geofísica pela Universidade de São Paulo (2007), doutorado (2012), pós-doutorado em Geociências pela Universidade de Campinas (2012), e pós-doutorado em Geofísica Aplicada pela Universidade da Bahia (2018) É especialista no estudo de estruturas de impacto meteorítico, trabalhando em parceria com pesquisadores do Museum für Naturkunde/Alemanha, onde realizou parte do seu doutorado, e no desenvolvimento de modelos numéricos de formação de crateras de impacto meteorítico. Tem experiência na área de Geociências, com ênfase em métodos potenciais, eletromagnéticos, e radiométricos, aplicados à Exploração Mineral. Atualmente é professor Adjunto da Universidade Federal da Bahia-UFBA, onde já foi chefe do Departamento de Geofísica (2016-2018), coordenador do Programa de Pós-Graduação em Geofísica (2019-2022), e atualmente é coordenador do Centro de Pesquisas em Geofísica e Geologia-CPGG/UFBA e vice coordenador do curso de Geofísica. É também chefe do Laboratório Integrado de Geofísica Aplicada(LAIGA/CPGG)."
            belowPhoto={<ResearcherEditButton researcherName="Marcos Alberto Rodrigues Vasconcelos" inline />}
          />
            <nav>
             <a href="https://lattes.cnpq.br/4567890123456789" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> email</b>
           <p>marcos.vasconcelos@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}