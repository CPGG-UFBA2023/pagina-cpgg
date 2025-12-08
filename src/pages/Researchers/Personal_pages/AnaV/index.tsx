import styles from './AnaV.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function AnaV() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Ana Virgínia Alves de Santana </p>
          <div className={styles.box1}>
            <DynamicResearcherProfile 
              researcherName="Ana Virgínia Alves de Santana"
              staticDescription="Professora, Pesquisadora e Extensionista. Geóloga formada pela Universidade Federal da Bahia - UFBA (2007.1). Geóloga de Exploração Mineral Júnior (2007-2009). Mestra em Geologia pela Universidade de Brasília - UnB (concluído em 2011.1). Doutorado integralizado em 2015, com defesa em 2016, pela UnB. Ingressa no serviço público como Professora do Magistério Superior em 2017.2. Coordenadora do curso de graduação em Geologia da UFBA no período de 2019 a 2021. Reconduzida para o biênio 2021-2023. Presidenta do Núcleo Docente Estruturante do curso de graduação em Geologia da UFBA (2022-2024). Presidenta do Fórum dos Cursos de Geologia do Brasil (2020-2023). Integrante da coordenação do Fórum Nacional da Mineração Responsável (FONAMIR), segmento acadêmico, desde 2023. Professora responsável pelas disciplinas GEO307 Geologia de Campo I e GEO310 Geologia de Campo II - curso de graduação em Geologia da UFBA. Ministra (ou) disciplina como professora convidada no programa de Pós-graduação em Geociências da Universidade Federal do Rio Grande do Sul (UFRGS), em 2017, e como professora colaboradora no programa de Pós-graduação em Geologia da UFBA, a partir de 2018. De 2011 a 2020 atuou como coordenadora técnica em projetos de Pesquisa e Desenvolvimento (PD) - PETROBRAS e UFRGS. Os projetos enfatizaram Estratigrafia de Sequências de Alta Resolução - ESAR - em rochas carbonáticas - sobretudo calcários microbiais (microbialitos) na sub-bacia de Irecê, Neoproterozoico, Cráton do São Francisco, BA. Os projetos pretenderam o entendimento de reservatórios de hidrocarbonetos, análogos ou similares, de diferente idades. Atualmente é pesquisadora no projeto PROSPECTA 4.0 - Infraestrutura de pesquisa e desenvolvimento tecnológico para modelagem exploratória de depósitos de minerais estratégicos financiado pelo CNPq (2022 -2025) - PDI em pesquisa mineral voltada para o estabelecimento de modelos de depósitos minerais com foco em Minerais Estratégicos e para a produção de materiais avançados, e coordena o projeto Estratigrafia de sequência em alta resolução foco em modelos preditivos para pesquisa de fosfato sedimentar na Bacia de Irecê (2023 - 2025). Integrante do Corpo Científico do CENTRO DE PESQUISA EM GEOFÍSICA E GEOLOGIA CPGG/UFBA. Possui interesse em pesquisas de temáticas relacionadas à ESAR sobretudo aquelas que somem para o melhor entendimento, predição e correlação de sequências, e consequente identificação de recursos energéticos, minerais e hídricos associados como, por exemplo, fosfato sedimentar, hidrocarbonetos, minerais e rochas industriais, águas subterrâneas, e outros. Ministra cursos de aperfeiçoamento sobre Estratigrafia de Sequências em Rochas Carbonáticas e Microbialitos. Participa ativamente da formação de estudantes de graduação com orientação, coorientação e/ou supervisão de trabalhos acadêmicos, técnicos e de extensão - e já atuou orientando discentes em diferentes universidades do Brasil. Coordena projeto e ações de Extensão e também a disciplina de Ação Curricular em Comunidade e em Sociedade (ACCS) A Terra como cura: geologia e os saberes tradicionais - vinculadas à Pró-reitora de Extensão - PROEXT UFBA. Atua (ou) como coordenadora de projetos nos programas PERMANECER e SANKOFA da Pró-reitora de Ações Afirmativas e Assistência Estudantil - PROAE UFBA. Possui experiência na área de Geociências, via execução de trabalhos técnicos diversos, em Mapeamento Geológico, Estratigrafia de Sequências, Proveniência Sedimentar, Exploração Mineral, Rochas Carbonáticas, Diagnóstico do Meio Físico, Unidades Geoambientais, Unidades de Conservação e Hidrogeologia. Tem interesse em trabalhar com Ensino, Pesquisa e Extensão e com essas interações - complementações - vivências gerar abordagens sob a ótica anticolonial e crítica. Gosta de estar na Natureza. Anseia por Humanidade. É grata por Ensinar e Servir."
              belowPhoto={<ResearcherEditButton researcherName="Ana Virgínia Alves de Santana" inline />}
            />
            <nav>
             <a href="https://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=K4706843J3" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>anavas@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}