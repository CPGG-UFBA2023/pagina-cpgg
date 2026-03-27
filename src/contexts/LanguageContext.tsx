import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Header
    'nav.home': 'Início',
    'nav.about': 'Sobre Nós',
    'nav.researchers': 'Pesquisadores',
    'nav.labs': 'Laboratórios',
    'nav.spaces': 'Espaços',
    'nav.reservations': 'Reservas',
    'nav.photos': 'Fotos',
    'nav.contact': 'Contato',
    'nav.admin': 'Adm',
    'nav.signin': 'Entrar',
    
    // Submenus
    'nav.institution': 'Instituição',
    'nav.cpgg': 'O CPGG',
    'nav.history': 'Nossa História',
    'nav.regulations': 'Regimento e Normas',
    'nav.personnel': 'Pessoal',
    'nav.coordination': 'Coordenação e Conselhos',
    'nav.technicians': 'Corpo Técnico',
    'nav.labsReservations': 'Laboratórios e reservas',
    'nav.spacesReservations': 'Espaços e Reservas',
    'nav.researchProjects': 'Projetos de Pesquisa',
    'nav.scientificProduction': 'Produção Científica',
    'nav.recipes': 'Receitas',
    // Header Institution Names
    'header.institutionTitle1': 'Centro de Pesquisa em Geofísica e Geologia',
    'header.institutionTitle2': 'Instituto de Geociências/Instituto de Física',
    'header.institutionTitle3': 'Universidade Federal da Bahia',
    
    // Footer
    'footer.oldPage': 'Página Antiga-CPGG',
    'footer.linkedin': 'Linkedin',
    'footer.instagram': 'Instagram',
    'footer.postGradGeophysics': 'Pós-Graduação em Geofísica',
    'footer.postGradGeology': 'Pós-Graduação em Geologia',
    'footer.rights': '© Todos os direitos reservados',
    
    // Contact
    'contact.emailUs': 'Envie-nos um e-mail',
    'contact.copyLink': 'Copiar link',
    'contact.address': 'Av. Anita Garibaldi, s/n -Acesso Portão 2. Ondina, Salvador - BA, 40170-290',
    'contact.building': 'Bloco anexo ao Instituto de Geociências',
    
    // Toast messages
    'toast.linkCopied': 'Link copiado',
    'toast.linkCopiedDesc': 'Abra uma nova guia e cole o link para iniciar a conversa.',
    
    // Spaces
    'spaces.title': 'Espaços e Reservas',
    'spaces.auditory': 'Auditório',
    'spaces.meetingRoom': 'Sala de reuniões',
    
    // Production
    'production.title': 'Produção',
    'production.content': 'Página de produção.',
    
    // History
    'history.title': 'Nossa História',
    'history.coordinators': 'Coordenadores do CPGG',
    'history.cpggHistory': 'A História do CPGG (por Dr. Olivar Lima)',
    
    // CPGG
    'cpgg.title': 'O CPGG',
    'cpgg.description1': 'O Centro de Pesquisa em Geofísica e Geologia (CPGG/UFBA) é um órgão complementar da UFBA vinculado aos Institutos de Geociências e de Física através da Resolução nº 02/2011 do Conselho Universitário. Foi reestruturado em março de 1997 visando, sobretudo, institucionalizar e suceder o Programa de Pesquisa e Pós-Graduação em Geofísica da Universidade Federal da Bahia (PPPG/UFBA), criado no ano de 1969 pelo prof. Carlos Alberto Dias. Tem como filosofia desenvolver programas interdisciplinares de pesquisa científica, assim como, fomentar o desenvolvimento da qualificação pessoal.',
    'cpgg.description2': 'O objetivo do CPGG é também continuar atuando como uma interface entre o setor industrial, organizações governamentais e a Universidade Federal da Bahia, por meio das suas áreas específicas de pesquisa tendo em vista a geração de oportunidades educacionais em nível de pós-graduação, e iniciação científica para a graduação; a disseminação do conhecimento através da transferência de tecnologia para a sociedade; tendo para isso uma estrutura administrativa adequada para dar suporte a novas áreas de pesquisa.',
    'cpgg.description3': 'Além de dar suporte aos cursos de doutorado, mestrado e graduação em Geofísica e em Geologia, o CPGG, a partir de 1999, deu início a um programa de Educação Continuada a nível de especialização com dois cursos em Sistemas Petrolíferos com ênfase em bacias sedimentares brasileiras e caracterização de reservatórios, dirigida ao pessoal da indústria.',
    'cpgg.description4': 'Após uma pausa de 5 anos, o CPGG voltou a ter seu corpo de pesquisadores ativo, agora sob a coordenação dos professsores Marcos Vasconcelos e Ruy Kikuchi. Um novo credenciamento foi realizado, de maneira que no momento atual, o órgão conta com {count} pesquisadores distribuídos em cinco Programas de Pesquisa. O momento atual impele o CPGG a despertar o interesse de novos pesquisadores, com o intuito de somar esforços para construir um Centro mais forte, e proporcionando recursos para desenvolvimento de pesquisas de ponta.',
    'cpgg.legend1': 'Hall de acesso da sede do CPGG',
    'cpgg.legend2': 'Fachada da sede do CGG em primeiro ângulo',
    'cpgg.legend3': 'Fachada da sede do CGG em segundo ângulo',
    
    // Regulations
    'regulations.title': 'Regimento e Normas',
    'regulations.regulation': 'Regimento',
    'regulations.accreditation': 'Deliberação Normativa para (re)credenciamento',
    'regulations.senior': 'Deliberação Normativa para pesquisadores seniores',
    
    // Researchers
    'researchers.title': 'Programas de Pesquisa e Corpo Científico',
    'researchers.oil': 'Exploração e Produção de Petróleo',
    'researchers.environment': 'Recursos Hidricos e Problemas Ambientais',
    'researchers.mineral': 'Petrologia, Metalogênese e Exp. Mineral',
    'researchers.oceanography': 'Oceanografia Física',
    'researchers.coast': 'Geologia Marinha e Costeira',
    
    // LAIGA
    'laiga.title': 'LAIGA',
    'laiga.subtitle': 'Laboratório Integrado de Geofísica Aplicada',
    'laiga.description1': 'O Laboratório Integrado de Geofísica Aplicada -LAIGA- foi criado no ano de 2023 com a reunião de equipamentos adquiridos ao longo da história do CPGG. Localiza-se na sala 112 do Bloco D do Instituto de Geociências. Atualmente é um dos Laboratórios de Geofísica mais completos do Brasil em termos de variedade de equipamentos reunidos no mesmo espaço físico, contando com amplo acervo de equipamentos e periféricos associados disponíveis para uso.',
    'laiga.description2': 'O LAIGA possui uma estrutura de cerca de 70 m² com três salas integradas: (i) almoxarifado; (ii) sala de dados; e (iii) eletrônica. Além disso, conta com uma sala de apoio de cerca de 35 m² onde ficam quardados os materiais de apoio para os trabalhos de campo.',
    'laiga.description3': 'Os principais objetivos do LAIGA consistem em (i) dar suporte às pesquisas internas dos pesquisadores do CPGG em todas as instâncias: graduação, pós-graduação e seus seus projetos de pesquisa; e (ii) fortalecer a pesquisa em Geofísica Aplicada de instituições parceiras de capital público e privado por meio de Convênios e Contratos de Prestação de Serviços.',
    'laiga.description4': 'O LAIGA está entre os laboratórios do CPGG que faz parte do Projeto de Desenvolvimento Institucional -PDI- criado para captação de recursos junto a outros órgãos públicos e empresas privadas. A coordenação do laboratório foi aprovada em reunião do Conselho Científico do CPGG no ano de 2024.',
    'laiga.description5': 'Acesse o site da Plataforma Nacional de Infraestrutura de Pesquisa-PNIPE, e veja as fotos e mais detalhes sobre os equipamentos disponíveis.',
    'laiga.pnipeSite': 'Site do PNIPE',
    'laiga.availability': 'Para saber da disponibilidade dos equipamentos e solicitá-los para uso, acesse nossa plataforma de requerimento',
    'laiga.chief': 'Coordenador do LAIGA',
    'laiga.chiefName': 'Prof. Marcos Alberto Rodrigues Vasconcelos',
    'laiga.requestButton': 'Requerimento',
    'laiga.room1': 'Sala 1- Almoxarifado com equipamentos',
    'laiga.room2': 'Sala 1-Sala de Dados',
    'laiga.room3': 'Sala 3- Eletrônica',
    'laiga.room4': 'Sala de apoio do LAIGA',
    
    // Admin
    'adm.title': 'Área Administrativa',
    'adm.subtitle': 'Selecione sua área de acesso:',
    'adm.ti': 'TI',
    'adm.tiAccess': 'Acesso Tecnologia da Informação',
    'adm.secretary': 'Secretária',
    'adm.secretaryAccess': 'Acesso Secretaria',
    'adm.coordination': 'Coordenação',
    'adm.coordinationAccess': 'Acesso Coordenação',
    
    // Lab Success
    'labSuccess.title': 'Reserva de Laboratório Realizada!',
    'labSuccess.message': 'Sua reserva do laboratório foi confirmada com sucesso.',
    
    // Map
    'map.title': 'Mapa de Visitantes da página',
    'map.subtitle': 'Visualize a localização de todos os visitantes do site ao redor do mundo',
    'map.loading': 'Carregando mapa...',
    'map.totalVisitors': 'Total de Visitantes',
    'map.trackedLocations': 'Localizações Rastreadas',
    'map.earthText': 'Conectando o mundo através das Geociências',
    'map.visitors': 'Visitantes',
    
    // Navigation Buttons
    'button.backToHome': 'Voltar para Home',
    'button.back': 'Voltar',
    'button.backToResearchers': 'Voltar para lista de pesquisadores',
    
    // Reservation Success
    'reservation.successTitle': 'Solicitação de Reserva Enviada com Sucesso!',
    'reservation.successMessage': 'A secretária do CPGG entrará em contato em breve por e-mail para confirmar sua reserva.',
    
    // Technicians
    'technicians.title': 'Corpo Administrativo e Técnico',
    'technicians.administrativeSecretary': 'Secretária Administrativa',
    'technicians.itTechnician': 'Técnica em T.I.',
    'technicians.driver': 'Motorista',
    'technicians.labTechnician': 'Técnico de Laboratório',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.researchers': 'Researchers',
    'nav.labs': 'Laboratories',
    'nav.spaces': 'Spaces',
    'nav.reservations': 'Reservations',
    'nav.photos': 'Photos',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.signin': 'Sign In',
    
    // Submenus
    'nav.institution': 'Institution',
    'nav.cpgg': 'The CPGG',
    'nav.history': 'Our History',
    'nav.regulations': 'Regulations and Standards',
    'nav.personnel': 'Personnel',
    'nav.coordination': 'Coordination and Councils',
    'nav.technicians': 'Technical Staff',
    'nav.labsReservations': 'Laboratories and Reservations',
    'nav.spacesReservations': 'Spaces and Reservations',
    'nav.researchProjects': 'Research Projects',
    'nav.scientificProduction': 'Scientific Production',
    'nav.recipes': 'Recipes',
    
    // Header Institution Names
    'header.institutionTitle1': 'Center for Research in Geophysics and Geology',
    'header.institutionTitle2': 'Institute of Geosciences/Institute of Physics',
    'header.institutionTitle3': 'Federal University of Bahia',
    
    // Footer
    'footer.oldPage': 'Old Page-CPGG',
    'footer.linkedin': 'Linkedin',
    'footer.instagram': 'Instagram',
    'footer.postGradGeophysics': 'Graduate Program in Geophysics',
    'footer.postGradGeology': 'Graduate Program in Geology',
    'footer.rights': '© All rights reserved',
    
    // Contact
    'contact.emailUs': 'E-mail us at',
    'contact.copyLink': 'Copy link',
    'contact.address': 'Av. Anita Garibaldi, s/n -Access Gate 2. Ondina, Salvador - BA, 40170-290',
    'contact.building': 'Annex block to the Institute of Geosciences',
    
    // Toast messages
    'toast.linkCopied': 'Link copied',
    'toast.linkCopiedDesc': 'Open a new tab and paste the link to start the conversation.',
    
    // Spaces
    'spaces.title': 'Spaces and Reservations',
    'spaces.auditory': 'Auditorium',
    'spaces.meetingRoom': 'Meeting Room',
    
    // Production
    'production.title': 'Production',
    'production.content': 'Production page.',
    
    // History
    'history.title': 'Our History',
    'history.coordinators': 'CPGG Coordinators',
    'history.cpggHistory': 'CPGG History (by Dr. Olivar Lima)',
    
    // CPGG
    'cpgg.title': 'The CPGG',
    'cpgg.description1': 'The Research Center for Geophysics and Geology (CPGG/UFBA) is a complementary body of UFBA linked to the Institutes of Geosciences and Physics through Resolution No. 02/2011 of the University Council. It was restructured in March 1997 aiming, above all, to institutionalize and succeed the Research and Graduate Program in Geophysics of the Federal University of Bahia (PPPG/UFBA), created in 1969 by Prof. Carlos Alberto Dias. Its philosophy is to develop interdisciplinary scientific research programs, as well as to foster personal qualification development.',
    'cpgg.description2': 'The objective of CPGG is also to continue acting as an interface between the industrial sector, governmental organizations and the Federal University of Bahia, through its specific research areas with a view to generating educational opportunities at the postgraduate level, and scientific initiation for undergraduate studies; the dissemination of knowledge through technology transfer to society; having for this an adequate administrative structure to support new areas of research.',
    'cpgg.description3': 'In addition to supporting doctoral, master and undergraduate courses in Geophysics and Geology, CPGG, from 1999 onwards, started a Continuing Education program at specialization level with two courses in Petroleum Systems with emphasis on Brazilian sedimentary basins and reservoir characterization, aimed at industry personnel.',
    'cpgg.description4': 'After a 5-year pause, CPGG has once again active its body of researchers, now under the coordination of professors Marcos Vasconcelos and Ruy Kikuchi. A new accreditation was carried out, so that at the present time, the body has {count} researchers distributed in five Research Programs. The current moment impels CPGG to awaken the interest of new researchers, with the aim of joining efforts to build a stronger Center, and providing resources for the development of cutting-edge research.',
    'cpgg.legend1': 'CPGG headquarters access hall',
    'cpgg.legend2': 'CGG headquarters facade from first angle',
    'cpgg.legend3': 'CGG headquarters facade from second angle',
    
    // Regulations
    'regulations.title': 'Regulations and Standards',
    'regulations.regulation': 'Regulations',
    'regulations.accreditation': 'Normative Deliberation for (re)accreditation',
    'regulations.senior': 'Normative Deliberation for senior researchers',
    
    // Researchers
    'researchers.title': 'Research Programs and Scientific Body',
    'researchers.oil': 'Oil Exploration and Production',
    'researchers.environment': 'Water Resources and Environmental Problems',
    'researchers.mineral': 'Petrology, Metallogeny and Mineral Exploration',
    'researchers.oceanography': 'Physical Oceanography',
    'researchers.coast': 'Marine and Coastal Geology',
    
    // LAIGA
    'laiga.title': 'LAIGA',
    'laiga.subtitle': 'Integrated Laboratory of Applied Geophysics',
    'laiga.description1': 'The Integrated Laboratory of Applied Geophysics -LAIGA- was created in 2023 with the gathering of equipment acquired throughout CPGG history. It is located in room 112 of Block D of the Institute of Geosciences. It is currently one of the most complete Geophysics Laboratories in Brazil in terms of variety of equipment gathered in the same physical space, having a wide collection of equipment and associated peripherals available for use.',
    'laiga.description2': 'LAIGA has a structure of about 70 m² with three integrated rooms: (i) warehouse; (ii) data room; and (iii) electronics. In addition, it has a support room of about 35 m² where support materials for fieldwork are stored.',
    'laiga.description3': 'The main objectives of LAIGA are (i) to support the internal research of CPGG researchers at all levels: undergraduate, graduate and their research projects; and (ii) to strengthen research in Applied Geophysics of partner institutions of public and private capital through Agreements and Service Provision Contracts.',
    'laiga.description4': 'LAIGA is among the CPGG laboratories that are part of the Institutional Development Project -PDI- created to raise funds from other public bodies and private companies. The laboratory coordination was approved at a meeting of the CPGG Scientific Council in 2024.',
    'laiga.description5': 'Access the National Research Infrastructure Platform-PNIPE website, and see photos and more details about the available equipment.',
    'laiga.pnipeSite': 'PNIPE Site',
    'laiga.availability': 'To know about equipment availability and request them for use, access our request platform',
    'laiga.chief': 'LAIGA Coordinator',
    'laiga.chiefName': 'Prof. Marcos Alberto Rodrigues Vasconcelos',
    'laiga.requestButton': 'Request',
    'laiga.room1': 'Room 1- Warehouse with equipment',
    'laiga.room2': 'Room 1-Data Room',
    'laiga.room3': 'Room 3- Electronics',
    'laiga.room4': 'LAIGA support room',
    
    // Admin
    'adm.title': 'Administrative Area',
    'adm.subtitle': 'Select your access area:',
    'adm.ti': 'IT',
    'adm.tiAccess': 'Information Technology Access',
    'adm.secretary': 'Secretary',
    'adm.secretaryAccess': 'Secretary Access',
    'adm.coordination': 'Coordination',
    'adm.coordinationAccess': 'Coordination Access',
    
    // Lab Success
    'labSuccess.title': 'Laboratory Reservation Completed!',
    'labSuccess.message': 'Your laboratory reservation has been successfully confirmed.',
    
    // Map
    'map.title': 'Website Visitors Map',
    'map.subtitle': 'Visualize the location of all website visitors around the world',
    'map.loading': 'Loading map...',
    'map.totalVisitors': 'Total Visitors',
    'map.trackedLocations': 'Tracked Locations',
    'map.earthText': 'Connecting the world through Geosciences',
    'map.visitors': 'Visitors',
    
    // Navigation Buttons
    'button.backToHome': 'Back to Home',
    'button.back': 'Back',
    'button.backToResearchers': 'Back to researchers list',
    
    // Reservation Success
    'reservation.successTitle': 'Reservation Request Sent Successfully!',
    'reservation.successMessage': 'The CPGG secretary will contact you shortly by email to confirm your reservation.',
    
    // Technicians
    'technicians.title': 'Administrative and Technical Staff',
    'technicians.administrativeSecretary': 'Administrative Secretary',
    'technicians.itTechnician': 'IT Technician',
    'technicians.driver': 'Driver',
    'technicians.labTechnician': 'Laboratory Technician',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}