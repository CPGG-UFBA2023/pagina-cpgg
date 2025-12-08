import styles from './Aroldo.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'


export function Aroldo() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Aroldo Misi </p>
          <div className={styles.box1}>
            <DynamicResearcherProfile 
              researcherName="Aroldo Misi"
              staticPhotoUrl="https://i.imgur.com/YQM1hAL.jpg"
              staticDescription={`Aroldo Misi, geólogo formado pela Universidade Federal da Bahia (UFBA) em 1964, concluiu o mestrado em Giséments Minéraux na Universidade de Paris IV (Paris-Sorbonne) em 1967. É Livre-Docente em Geologia Econômica/Metalogênese (equiv. a doutorado) pela Universidade Federal da Bahia desde 1979. Realizou pós-doutorado na Universidade do Texas em Austin, EUA, onde foi Pesquisador Visitante entre novembro de 1988 e janeiro de 1990. Foi também Pesquisador Visitante da Universidade de Ottawa, Canadá, em 1992. Professor Titular da Universidade Federal da Bahia, é Pesquisador nível 1 do Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq), tendo participado do Comitê Assessor da área de Geociências até setembro de 2009. Foi membro da Comissão de Geociências da CAPES (2005 a 2010). Foi Diretor-Técnico da Companhia Baiana de Pesquisa Mineral (CBPM) durante 8 anos (1979 a 1987). Publicou diversos artigos científicos em periódicos internacionais especializados e em anais de eventos científicos internacionais e nacionais. Possui 21 capítulos de livros e 9 livros publicados. Recebeu a Medalha de Ouro Henri Gorceix em 2003 pela Excelência na Formação de Recursos Humanos e o diploma em Reconhecimento pela Participação no Desenvolvimento das Geociências no Brasil (1986), ambos outorgados pela Sociedade Brasileira de Geologia. Recebeu também o diploma de Reconhecimento à Dedicação e aos Serviços Prestados ao Desenvolvimento da Geologia Econômica e Metalogênese (Homenagem no Dia do Geólogo, em 2003), pelo CREA-BA, Associação Baiana de Geólogos (ABG) e Sindicato dos Engenheiros da Bahia (SENGE). e o título de Mestre do Ensino de Geologia na Bahia em 2006, pela Câmara de Vereadores de Salvador. É Membro Titular da Academia Brasileira de Ciências (ABC) desde 2008 e da Academia de Ciências da Bahia (ACB) desde sua fundação, em 2011. Em 2010, foi admitido como membro da Ordem Nacional do Mérito Científico (ONMC), classe Comendador (Decreto Presidencial, D.O.U., 28/12/2010). Fellow da Society of Economic Geologists, a partir de 2010. Em 2011, foi homenageado pelos núcleos Nordeste e Bahia-Sergipe da Sociedade Brasileira de Geologia por sua contribuição na formação de geólogos na região NE e a sua atuação científica no desenvolvimento das geociências no Brasil. Em 2018 recebeu o título de Membro Honorário da Sociedade Brasileira de Geologia. Em 2020 recebeu a medalha Teodoro Sampaio, do Núcleo da Bahia da Sociedade Brasileira de Geologia, em reconhecimento à sua importante contribuição à geologia do Estado da Bahia.`}
              belowPhoto={<ResearcherEditButton researcherName="Aroldo Misi" inline />}
            />
            <nav>
             <a href="https://lattes.cnpq.br/2455979526507877" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>aroldo.misi@gmail.com</p> 
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}