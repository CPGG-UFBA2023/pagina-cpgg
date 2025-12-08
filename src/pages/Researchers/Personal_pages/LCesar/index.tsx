import styles from './LCesar.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function LCesar() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Luiz Cesar Correa Gomes </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Luiz César Corrêa Gomes"
            staticDescription="Graduado em Geologia pela Universidade Federal da Bahia (1982), mestrado em Geoquímica e Meio Ambiente pela Universidade Federal da Bahia (1992), doutorado em Geociências pela Universidade Estadual de Campinas (2000) e pós-doutorado em evolução tectônica de Bacias Sedimentares pela UFBA (2008) e pesquisador visitante sênior em Modelagem Física de bacias tipo Riftes pelo ESD do Royal Holloway da Universidade de Londres (2022-2023). Publicou dezenas de artigos em revistas indexadas nacionais e internacionais, editou e escreveu livros temáticos e capítulos de livros. Coordena e vice-coordena diversos projetos de pesquisa financiados pelo CNPq e pela PETROBRAS. Orienta monografias de graduação, mestrado e doutorado. Foi Professor Associado III do Centro Federal de Educação Tecnológica da Bahia, atualmente é professor Associado III do Instituto de Geociências da Universidade Federal da Bahia, pesquisador permanente do Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq), é revisor de artigos para revistas nacionais e internacionais de corpo editorial. Participou de cursos de aperfeiçoamento no Brasil, Sul da África, Alpes, Reino Unido e Cráton da China. Tem experiência na área de Geociências, com ênfase em Geologia Estrutural, Tectônica e Mecânica de Rochas, atuando principalmente nos seguintes temas: Geologia da Bahia, do Brasil, da América do Sul, da África, da Europa e Asia, Geomorfologia Estrutural, Reologia de Magmas, Modelagem Física Analógica, Reconstituição de paleocontinentes, Mecânica de Rochas/Geotecnia, Dinâmica evolutiva de Bacias Sedimentares, Neotectônica, Dinâmica de zonas de cisalhamento e Prospecção de hidrocarbonetos e água subterrânea."
            belowPhoto={<ResearcherEditButton researcherName="Luiz César Corrêa Gomes" inline />}
          />
            <nav>
             <a href="https://lattes.cnpq.br/9902635897527204" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>lccgomes@ufba.br</p>
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}