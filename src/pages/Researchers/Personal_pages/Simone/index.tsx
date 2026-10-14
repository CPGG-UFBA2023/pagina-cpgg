import styles from './Simone.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Simone() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Simone Cerqueira Pereira Cruz" />
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}><span>Simone Cerqueira Pereira Cruz</span><ResearcherEditButton researcherName="Simone Cerqueira Pereira Cruz" inline /></p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Simone Cerqueira Pereira Cruz"
            staticDescription="Possui graduação em Bacharelado em Geologia pela Universidade Federal da Bahia (1997), mestrado em Evolução Crustal e Recursos Naturais pela Universidade Federal de Ouro Preto (2000) e doutorado em Evolução Crustal e Recursos Naturais pela Universidade Federal de Ouro Preto (2004), ambas com ênfase em Geologia Estrutural / Tectônica. Fez Pós-Doutotarado em Petrologia, Metalogênese e Exploração Mineral. Atualmente é professora Associada do Departamento de Geologia da Universidade Federal da Bahia, é Presidenta da Sociedade Brasileira de Geologia. Tem experiência na área de Geociências, com ênfase em Geologia Estrutural, Geotectônica e Recursos Minerais."
          />

            <nav>
             <a href="https://lattes.cnpq.br/8624206151398922" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>simonecruz@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}