import styles from './Amin.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Amin() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Amin Bassrei </p>
          <div className={styles.box1}>
            <DynamicResearcherProfile 
              researcherName="Amin Bassrei"
              staticDescription="Amin Bassrei possui graduação em Engenharia Elétrica (Eletrotécnica) pela UFBA - Universidade Federal da Bahia (1985), graduação em Engenharia Elétrica (Eletrônica) pela UFBA (1987), graduação em Economia pela Universidade Católica do Salvador (1989), mestrado em Letras e Linguística pela UFBA (2001) e doutorado em Geofísica pela UFBA (1990). Fez estágio de pós-doutorado no Earth Resources Laboratory, Massachusetts Institute of Technology (março 1992 - fevereiro 1994). Realizou um segundo estágio de pós-doutorado no Geophysics Department, School of Earth, Energy Environmental Sciences, Stanford University (setembro 2015 - agosto 2016). Foi professor do Departamento de Física Geral do Instituto de Física da UFBA de 1994 a 2009. Atualmente é professor titular do Departamento de Geofísica do Instituto de Geociências da UFBA. Desde 1990 é pesquisador do CPGG/UFBA - Centro de Pesquisa em Geofísica e Geologia (antigo PPPG/UFBA - Programa de Pesquisa e Pós-graduação em Geofísica). Foi vice-chefe do Departamento de Física Geral da UFBA (julho 1998 - julho 2000). Foi vice-coordenador do PPGEOF - Programa de Pós-graduação em Geofísica da UFBA (setembro 2000 - setembro 2002). É atualmente o vice-coordenador do PPGEOF (março 2024 - março 2026). Foi vice-coordenador do curso de graduação em Geofísica da UFBA em três ocasiões (março 2003 - setembro 2004; setembro 2008 - abril 2009; junho 2012 - março 2013). Foi coordenador do curso de graduação em Geofísica da UFBA em dois mandatos (setembro 2004 - setembro 2008). Foi chefe pro tempore do Departamento de Geofísica da UFBA em abril e maio de 2012. Foi coordenador do PPGEOF em três mandatos (agosto 2009 - agosto 2011; março 2013 - março 2015; março 2017 - março 2019). Foi coordenador da Rede Cooperativa de Pesquisa em Geofísica de Exploração - Rede FINEP 01 (julho 2009 - agosto 2015; outubro 2016 - outubro 2018). Foi vice-coordenador do INCT-GP - Instituto Nacional de Ciência e Tecnologia em Geofísica de Petróleo (abril 2009 - agosto 2010) e membro do Comitê Gestor do INCT-GP desde setembro de 2010. Foi membro da Câmara Técnica de Ciências Matemáticas e Naturais da FAPESB - Fundação de Apoio à Pesquisa do Estado da Bahia (dezembro 2008 - dezembro 2012). Foi coordenador do projeto PETROBRAS Aplicação da Ressonância Magnética Nuclear para o Monitoramento do Armazenamento Geológico de CO2 (março 2010 - dezembro 2012). Foi coordenador do projeto PETROBRAS Aplicação da Tomografia Sísmica para o Monitoramento do Armazenamento Geológico de CO2 (março 2010 - abril 2014). Foi coordenador do projeto PETROBRAS Investigação do uso da Tomografia Interpoços como Ferramenta para Caracterização de Reservatórios Complexos (dezembro 2009 - julho 2015). Tem experiência de pesquisa na área de Geociências, com ênfase em Geofísica Aplicada, atuando principalmente nos seguintes temas: sismologia de exploração, análise de sinais geofísicos (perfis de poços e séries climáticas), inversão de dados gravimétricos, inversão de dados sísmicos, tomografia sísmica, tomografia eletromagnética, e armazenamento geológico de CO2. Orientou 7 teses de doutorado, 20 dissertações de mestrado (sendo 1 co-orientação) e 13 trabalhos de graduação, todas em Geofísica."
              belowPhoto={<ResearcherEditButton researcherName="Amin Bassrei" inline />}
            />
            <nav>
             <a href="https://lattes.cnpq.br/0254085595142341" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>bassrei@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}