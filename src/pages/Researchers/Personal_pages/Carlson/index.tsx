import styles from './Carlson.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Carlson() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Carlson de Matos Maia Leite  </p>
          <div className={styles.box1}>
           <DynamicResearcherProfile 
             researcherName="Carlson de Matos Maia Leite"
             staticDescription={`Possui graduação em Geologia pela Universidade de Brasília (1978), mestrado em Exploração Mineral pela Universidade de Londres- Royal School of Mines (1985) e doutorado em Geologia pela Universidade Federal da Bahia (2002). Trabalhou como geólogo de campo e petrógrafo na Companhia Baiana de Pesquisa Mineral no período de 1978-1997, quando desenvolveu trabalhos de mapeamento geológico em escalas regional e de detalhe na prospecção de ouro, vanádio, sulfetos de metais-base e rocha fosfática em unidades de rochas pré-cambrianas. No período entre 2002 e 2020, trabalhou na Petrobras como geólogo no acompanhamento de poços e nas áreas de sedimentologia, estratigrafia e de tectônica rúptil na exploração e explotação de petróleo nas bacias rifte, mesozóicas, do Recôncavo e do Tucano Sul. Atualmente é Professor Associado III na Universidade Federal da Bahia, na cadeira de Geologia Estrutural, cargo que ocupa desde 2010. Os interesses de estudo e pesquisa nas áreas de Geociências incluem petrologia metamórfica e sua relação com a deformação regional durante a tectônica colisional de blocos continentais; tectônica de bacias e petrologia sedimentar com ênfase em diagênese estrutural associada a deformação rúptil em bacias rifte. Nestas áreas, orientou trabalhos de conclusão de curso em geologia, tem publicações em revistas de geociências, nacionais e internacionais com corpo editorial, bem como, revisou manuscritos para os seguintes periódicos: Marine and Petroleum Geology, Journal of South American Earth Sciences, Journal of Structural Geology e Journal of Metamorphic Petrology.`}
             belowPhoto={<ResearcherEditButton researcherName="Carlson de Matos Maia Leite" inline />}
           />
            <nav>
             <a href="https://lattes.cnpq.br/9331382619641585" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>cmml@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}