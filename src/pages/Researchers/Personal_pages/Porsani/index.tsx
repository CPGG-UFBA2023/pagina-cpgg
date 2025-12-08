import styles from './Porsani.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Porsani() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Milton José Porsani </p>
          <div className={styles.box2}>
          </div>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Milton José Porsani"
            staticDescription="Possui graduação em Geologia pela Universidade de São Paulo (1976), graduação em Educação pela Faculdade de Educação pela Universidade de São Paulo (1978), mestrado em Geofísica pela Universidade Federal do Pará (1981), doutorado em Geofísica pela Universidade Federal da Bahia (1986) e realizou estágio de pós-doutorado no Institute of Geophysics da Universidade do Texas (setembro de 1992 a março de 1994). Professor do Departamento de Geologia e Geofísica Aplicada da UFBA desde janeiro de 1990 e Professor Titular desde 2000. Pesquisador do CNPQ desde 1990 e Pesquisador 1A desde 2004. Foi cordenador da Rede Cooperativa de Pesquisa NNE (FINEP) de 2003 a junho de 2009. Atualmente é coordenador do projeto Instituto Nacional de Ciência e Tecnologia de Geofísica do Petróleo do CNPq (INCT-GP). É Membro Titular da Academia de Ciências da Bahia (2011), e Membro Titular da Academia Brasileira de Ciência (2018). Em 2017 recebeu o prêmio Nero Passos da Sociedade Brasileira de Geofísica. As áreas de interesse compreendem: estudo de problemas inversos em geofísica, processamento sísmico, desenvolvimento de métodos e algoritmos de inversão e filtragem de dados sísmicos, exploração de água subterrânea e estudos geofísicos voltados para o monitoramento de plumas de contaminação e controle da qualidade do meio ambiente."
            belowPhoto={<ResearcherEditButton researcherName="Milton José Porsani" inline />}
          />
            <nav>
             <a href="https://lattes.cnpq.br/1428637808064409" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>milton.porsani@gmail.com</p> 
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}