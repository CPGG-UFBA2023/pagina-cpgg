import styles from './Susana.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Susana() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Susana Silva Cavalcanti" />
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}><span>Susana Silva Cavalcanti</span><ResearcherEditButton researcherName="Susana Silva Cavalcanti" inline /></p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Susana Silva Cavalcanti"
            staticDescription="Possui doutorado em Geofísica pela Universidade Federal da Bahia (2006) e mestrado em Geofísica pela Universidade Federal da Bahia (1999). É graduada em Engenharia Sanitária e em Engenharia Civil, possui experiência profissional na área ambiental e em projetos de Sistemas de Abastecimento de Água. Atualmente é professora Associada IV e pesquisadora no Instituto de Geociências da UFBA, atuando principalmente nos seguintes temas: Geofísica de Exploração de Águas Subterrâneas e Geofísica Aplicada a Estudos Ambientais, Métodos Geofísicos Elétricos e Gestão de Resíduos Sólidos e de Recursos Hídricos."
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="https://lattes.cnpq.br/3712697556346790" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>scavalcanti@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}