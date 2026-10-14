import styles from './Alice.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Alice() {
  console.log('[Researchers] Alice page render');
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}><span>Alice Marques Pereira Lau</span><ResearcherEditButton researcherName="Alice Marques Pereira Lau" inline /></p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Alice Marques Pereira Lau"
            staticDescription="Doutora em geologia (2019). Mestre em Geociências e Meio Ambiente (2014). Bacharel em Geofísica (2011). Pesquisadora e Professora Adjunta no Instituto de Geociências da Universidade Federal da Bahia IGEO-UFBA, ministrando aulas para os cursos de geologia, engenharias e biologia. Foi professora adjunta de 2019 a 2022 na Pontifícia Universidade Católica do Rio Grande do Sul PUC-RS, onde atuou nos cursos de física com linha em geofísica, engenharias e geografia. Atua na área de geociências com ênfase em geologia, topografia e geofísica aplicada a estudos ambientais, hidrogeologia, exploração mineral e geologia de engenharia. Pesquisadora e bolsista DTI-A do CNPq em projeto de pesquisa mineral. Revisora ad hoc de periódicos científicos e membro associada da SBG e SBGf."
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="https://lattes.cnpq.br/8498244876614542" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>alicelau@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}