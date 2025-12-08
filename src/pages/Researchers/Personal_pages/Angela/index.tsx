import styles from './Angela.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Angela() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
           <p> Angela Beatriz de Menezes Leal </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Angela Beatriz de Menezes Leal"
            staticDescription="A pesquisadora possui graduação em Geologia pela Universidade Federal da Bahia (1988), mestrado em Geociências (Mineralogia e Petrologia) pela Universidade de São Paulo (1992), doutorado em Geociências (Mineralogia e Petrologia) pela Universidade de São Paulo (1997), Pós-Doutorado pela University of Texas at San Antonio (2006-2007), na Universite Blaise Pascal Clermont-Ferrand (2010) e na University of Florida (2022, em andamento). Atualmente é Professora Titular da Universidade Federal da Bahia e atua como professora permanente no Curso de Pós-Graduação em Geologia na área de Petrologia, Metalogênese e Exploração Mineral. É vice-lider do Grupo de Pesquisa Núcleo de Geologia Básica na Plataforma Lattes. Tem experiência na área de Geociências, com ênfase em petrologia, geoquímica e geocronologia, atuando principalmente nos seguintes temas: diques máficos, greenstone belts, magmatismo máfico e ultramáfico."
            belowPhoto={<ResearcherEditButton researcherName="Angela Beatriz de Menezes Leal" inline />}
          />
            <nav>
             <a href="https://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=K4797800A4" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>angelab@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}