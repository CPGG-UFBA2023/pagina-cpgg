import styles from './Marilia.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Marilia() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Marília de Dirceu Machado de Oliveira </p>
          <div className={styles.box1}>
            <DynamicResearcherProfile 
              researcherName="Marília de Dirceu Machado de Oliveira"
              staticDescription="Possui graduação Ciências Biológicas, Bacharelado em Organismos Aquáticos pela Universidade Federal da Bahia (1989), mestrado em Geologia pela Universidade Federal da Bahia (2002) e doutorado em Geologia pela Universidade Federal da Bahia (2007). Atualmente é pesquisador colaborador da Universidade Federal da Bahia, no Grupo de Pesquisas Recifes de Corais e Mudanças Globais (RECOR). Tem trabalhado na conservação e impacto das mudanças climáticas em ecossistemas de recifes de corais desde 2000. Responsável pelo desenvolvimento de experimentos em aquários no Laboratório de Recifes de Corais. Tem experiência na área de Oceanografia, com ênfase em estudos da Interação entre os Organismos Marinhos (corais) e os Parâmetros Ambientais, atuando principalmente nos seguintes temas: recifes de corais, calcificação em corais, avaliação de impactos ambientais, hidrocorais e resiliência dos recifes de corais."
              belowPhoto={<ResearcherEditButton researcherName="Marília de Dirceu Machado de Oliveira" inline />}
            />
            <nav>
             <a href="https://lattes.cnpq.br/2945071439166054" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>mariliadirceu.mo@gmail.com</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}