import styles from './alexandre.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { ResearcherPhoto } from '../../../../components/ResearcherPhoto'
import { BackButton } from '../../../../components/BackButton'

export function Alexandre() {
  console.log('[Researchers] Alexandre page render');
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <ResearcherPhoto researcherName="Alexandre Barreto Costa" />
          <p> Alexandre Barreto Costa </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Alexandre Barreto Costa"
            staticDescription="Possui graduação em Bacharelado Em Física pela Universidade Federal da Bahia (1997), mestrado em Geofísica pela Universidade Federal da Bahia (2001) e doutorado em Geofísica pela Universidade Federal da Bahia (2006). Atualmente é pesquisador do Centro de Pesquisa em Geofísica e Geologia da UFBA e professor associado IV da Universidade Federal da Bahia. Tem experiência na área de Geociências, atuando principalmente nos seguintes temas: Geotermia e Fluxo Térmico, espectrometria gama, análise de isótopos estáveis, datação por Carbono-14 e Chumbo-210 e dados de levantamentos aerogeofísicos."
            belowPhoto={<ResearcherEditButton researcherName="Alexandre Barreto Costa" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="http://lattes.cnpq.br/5484149216615431" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>abc@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}