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
    'nav.minutes': 'Atas',
    'nav.seniorResearchers': 'Pesquisadores Seniores',
    'nav.requests': 'Solicitações',
    'nav.repairs': 'Reparos e serviços técnicos',
    'nav.map': 'Mapa',
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
    'footer.specialization': 'Curso de Especialização',
    'footer.instagramLabel': 'Instagram do CPGG',
    'footer.rights': '© Todos os direitos reservados',
    
    // Contact
    'contact.emailUs': 'Envie-nos um e-mail',
    'contact.copyLink': 'Copiar link',
    'contact.address': 'Av. Anita Garibaldi, s/n -Acesso Portão 2. Ondina, Salvador - BA, 40170-290',
    'contact.building': 'Bloco anexo ao Instituto de Geociências',
    'contact.copyError': 'Não foi possível copiar automaticamente. Copie manualmente:',
    'contact.whatsappLabel': 'Copiar link do WhatsApp',
    'contact.whatsappIcon': 'Ícone do WhatsApp',
    
    // Toast messages
    'toast.linkCopied': 'Link copiado',
    'toast.linkCopiedDesc': 'Abra uma nova guia e cole o link para iniciar a conversa.',
    
    // Spaces
    'spaces.title': 'Espaços e Reservas',
    'spaces.auditory': 'Auditório',
    'spaces.meetingRoom': 'Sala de reuniões',

    // Public navigation pages
    'requests.title': 'Solicitações',
    'requests.repairs': 'Reparos e Serviços Técnicos',
    'labs.title': 'Laboratórios e Reservas',
    'labs.lemar': 'Laboratório de Espectrometria de Massas de Alta Resolução',
    'labs.ltmrx': 'Laboratório de Tecnologia Mineral',
    'labs.lamod': 'Laboratório de Modelagem Física',
    'labs.labfis': 'Laboratório de Propriedades Físicas das Rochas',
    'labs.lagep': 'Laboratório de Geofísica e Exploração de Petróleo',
    'panorama.title': 'Vista Aérea 360° do CPGG',
    'panorama.instructions': 'Arraste para explorar • Use o scroll para zoom • Clique no ícone para tela cheia',
    'panorama.loading': 'Carregando panorama 360°...',
    'panorama.imageError': 'Erro ao carregar imagem panorâmica',
    'panorama.libraryError': 'Erro ao carregar biblioteca de visualização',
    'panorama.viewerError': 'Erro ao inicializar visualizador',
    'panorama.viewerTitle': 'CPGG - Vista Aérea 360°',
    'news.loading': 'Carregando notícias...',
    'news.previous': 'Notícia anterior',
    'news.next': 'Próxima notícia',
    'news.goTo': 'Ir para notícia',
    'news.pause': 'Pausar',
    'news.play': 'Reproduzir',
    'news.stop': 'PARAR',
    'news.start': 'INICIAR',
    'news.viewAll': 'Ver todas as notícias →',
    'news.presentationMode': 'Modo Apresentação',
    
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
    'laiga.viceChief': 'Vice-coordenadora do LAIGA',
    'laiga.viceChiefName': 'Profa. Susana Silva Cavalcanti',

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
    'nav.minutes': 'Minutes',
    'nav.seniorResearchers': 'Senior Researchers',
    'nav.requests': 'Requests',
    'nav.repairs': 'Repairs and Technical Services',
    'nav.map': 'Map',
    
    // Header Institution Names
    'header.institutionTitle1': 'Center for Research in Geophysics and Geology',
    'header.institutionTitle2': 'Institute of Geosciences/Institute of Physics',
    'header.institutionTitle3': 'Federal University of Bahia',
    
    // Footer
    'footer.oldPage': 'Old CPGG Website',
    'footer.linkedin': 'Linkedin',
    'footer.instagram': 'Instagram',
    'footer.postGradGeophysics': 'Graduate Program in Geophysics',
    'footer.postGradGeology': 'Graduate Program in Geology',
    'footer.specialization': 'Specialization Program',
    'footer.instagramLabel': 'CPGG Instagram',
    'footer.rights': '© All rights reserved',
    
    // Contact
    'contact.emailUs': 'Email us at:',
    'contact.copyLink': 'Copy link',
    'contact.address': 'Av. Anita Garibaldi, s/n — Gate 2, Ondina, Salvador, BA 40170-290, Brazil',
    'contact.building': 'Annex to the Institute of Geosciences',
    'contact.copyError': 'The link could not be copied automatically. Please copy it manually:',
    'contact.whatsappLabel': 'Copy WhatsApp link',
    'contact.whatsappIcon': 'WhatsApp icon',
    
    // Toast messages
    'toast.linkCopied': 'Link copied',
    'toast.linkCopiedDesc': 'Open a new tab and paste the link to start the conversation.',
    
    // Spaces
    'spaces.title': 'Spaces and Reservations',
    'spaces.auditory': 'Auditorium',
    'spaces.meetingRoom': 'Meeting Room',

    // Public navigation pages
    'requests.title': 'Requests',
    'requests.repairs': 'Repairs and Technical Services',
    'labs.title': 'Laboratories and Reservations',
    'labs.lemar': 'High-Resolution Mass Spectrometry Laboratory',
    'labs.ltmrx': 'Mineral Technology Laboratory',
    'labs.lamod': 'Physical Modeling Laboratory',
    'labs.labfis': 'Rock Physics Laboratory',
    'labs.lagep': 'Geophysics and Petroleum Exploration Laboratory',
    'panorama.title': '360° Aerial View of CPGG',
    'panorama.instructions': 'Drag to explore • Scroll to zoom • Select the icon for full screen',
    'panorama.loading': 'Loading 360° panorama...',
    'panorama.imageError': 'Unable to load the panoramic image',
    'panorama.libraryError': 'Unable to load the panorama viewer',
    'panorama.viewerError': 'Unable to initialize the panorama viewer',
    'panorama.viewerTitle': 'CPGG — 360° Aerial View',
    'news.loading': 'Loading news...',
    'news.previous': 'Previous article',
    'news.next': 'Next article',
    'news.goTo': 'Go to article',
    'news.pause': 'Pause',
    'news.play': 'Play',
    'news.stop': 'PAUSE',
    'news.start': 'PLAY',
    'news.viewAll': 'View all news →',
    'news.presentationMode': 'Presentation Mode',
    
    // Production
    'production.title': 'Production',
    'production.content': 'Production page.',
    
    // History
    'history.title': 'Our History',
    'history.coordinators': 'CPGG Coordinators',
    'history.cpggHistory': 'CPGG History (by Dr. Olivar Lima)',
    
    // CPGG
    'cpgg.title': 'The CPGG',
    'cpgg.description1': 'The Center for Research in Geophysics and Geology (CPGG/UFBA) is a complementary unit of UFBA linked to the Institutes of Geosciences and Physics under University Council Resolution No. 02/2011. It was restructured in March 1997, primarily to institutionalize and succeed the Research and Graduate Program in Geophysics at the Federal University of Bahia (PPPG/UFBA), founded in 1969 by Prof. Carlos Alberto Dias. Its mission is to develop interdisciplinary scientific research programs and foster professional development.',
    'cpgg.description2': 'CPGG also serves as a bridge between industry, government organizations and the Federal University of Bahia. Through its research areas, it creates graduate and undergraduate research opportunities, shares knowledge with society through technology transfer, and provides the administrative structure needed to support emerging fields of research.',
    'cpgg.description3': 'In addition to supporting doctoral, master’s and undergraduate programs in Geophysics and Geology, CPGG launched a continuing education program in 1999. It offered two specialization courses in Petroleum Systems, focusing on Brazilian sedimentary basins and reservoir characterization for industry professionals.',
    'cpgg.description4': 'After a five-year pause, CPGG resumed its research activities under the coordination of Prof. Marcos Vasconcelos and Prof. Ruy Kikuchi. Following a new accreditation process, the Center now has {count} researchers across five Research Programs. CPGG seeks to attract new researchers, combine expertise and secure resources for cutting-edge research.',
    'cpgg.legend1': 'CPGG headquarters access hall',
    'cpgg.legend2': 'CPGG headquarters façade — first view',
    'cpgg.legend3': 'CPGG headquarters façade — second view',
    
    // Regulations
    'regulations.title': 'Regulations and Standards',
    'regulations.regulation': 'Regulations',
    'regulations.accreditation': 'Normative Deliberation for (re)accreditation',
    'regulations.senior': 'Normative Deliberation for senior researchers',
    
    // Researchers
    'researchers.title': 'Research Programs and Research Staff',
    'researchers.oil': 'Oil Exploration and Production',
    'researchers.environment': 'Water Resources and Environmental Problems',
    'researchers.mineral': 'Petrology, Metallogeny and Mineral Exploration',
    'researchers.oceanography': 'Physical Oceanography',
    'researchers.coast': 'Marine and Coastal Geology',
    
    // LAIGA
    'laiga.title': 'LAIGA',
    'laiga.subtitle': 'Integrated Laboratory of Applied Geophysics',
    'laiga.description1': 'The Integrated Laboratory of Applied Geophysics (LAIGA) was established in 2023 by bringing together equipment acquired throughout CPGG’s history. Located in Room 112, Block D, at the Institute of Geosciences, it is one of Brazil’s most comprehensive geophysics laboratories in terms of the variety of equipment available in a single facility.',
    'laiga.description2': 'LAIGA has a structure of about 70 m² with three integrated rooms: (i) warehouse; (ii) data room; and (iii) electronics. In addition, it has a support room of about 35 m² where support materials for fieldwork are stored.',
    'laiga.description3': 'LAIGA’s main objectives are: (i) to support CPGG research at undergraduate and graduate levels and across its research projects; and (ii) to strengthen Applied Geophysics research at public- and private-sector partner institutions through cooperation agreements and service contracts.',
    'laiga.description4': 'LAIGA is among the CPGG laboratories that are part of the Institutional Development Project -PDI- created to raise funds from other public bodies and private companies. The laboratory coordination was approved at a meeting of the CPGG Scientific Council in 2024.',
    'laiga.description5': 'Visit the National Research Infrastructure Platform (PNIPE) to view photos and further details about the available equipment.',
    'laiga.pnipeSite': 'PNIPE Site',
    'laiga.availability': 'To check equipment availability or submit a request, visit our request platform.',
    'laiga.chief': 'LAIGA Coordinator',
    'laiga.chiefName': 'Prof. Marcos Alberto Rodrigues Vasconcelos',
    'laiga.viceChief': 'LAIGA Vice-Coordinator',
    'laiga.viceChiefName': 'Prof. Susana Silva Cavalcanti',

    'laiga.requestButton': 'Request',
    'laiga.room1': 'Room 1 — Equipment Storage',
    'laiga.room2': 'Room 2 — Data Room',
    'laiga.room3': 'Room 3 — Electronics',
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