import styles from './Alexsandro.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Alexsandro() {
  console.log('[Researchers] Alexsandro page render');
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Alexsandro Guerra Cerqueira </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Alexsandro Guerra Cerqueira"
            staticDescription="Bacharel em geofísica formado pela Universidade Federal da Bahia (2013), Mestre em Geofísica Aplicada (2015) e Doutor em Geofísica Aplicada (2019) pela Universidade Federal da Bahia. Durante o bacharelado e o mestrado desenvolveu pesquisas na área de parametrização, modelagem e inversão de campos de velocidades sísmicas utilizando séries e transformada discreta wavelet. Durante o doutorado desenvolveu pesquisas na área de perfilagem geofísica de poços e petrofísica, com ênfase no uso de algoritmos supervisionados e não-supervisionados para a detecção de padrões de litofácies e tipos de fluido e obtenção de parâmetros petrofísicos do sistema aquífero São Sebastião - Bacia do Recôncavo. Atualmente é professor adjunto, no regime de 40 horas DE, na Universidade Federal da Bahia, lotado no Departamento de Geofísica do Instituto de Geociências (IGEO). Atualmente é pesquisador do Instituto Nacional de Ciência e Tecnologia de Geofísica do Petróleo (INCT-GP) onde desenvolve pesquisas e orienta alunos de iniciação científica na área de inteligência artificial aplicada a geofísica, onde implementa trabalhos relacionados a interpretação de perfis geofísicos e processamento e interpretação de dados sísmicos 3D. Lider do Grupo de Estudo e Aplicação de Inteligência Artificial em Geofísica da UFBA (GAIA-UFBA) e coordenador dos projetos de desenvolvimento institucional GETAINFRA / Estruturação modernizadora para desenvolvimento de projetos de P, D & I no GETA/IGEO e pesquisa Desenvolvimento de Software Livre de Inteligência Artificial e Implementação de Biblioteca para Apoio à Interpretação Sísmica."
            belowPhoto={<ResearcherEditButton researcherName="Alexsandro Guerra Cerqueira" inline />}
          />
            <nav>
             <a href="https://lattes.cnpq.br/4993793853330521" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>alexsandrocerqueira@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}