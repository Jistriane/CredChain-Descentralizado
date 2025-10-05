export type Language = 'pt-BR' | 'en' | 'es';

export interface Translations {
  // Navigation
  navigation: {
    dashboard: string;
    score: string;
    payments: string;
    chat: string;
    wallet: string;
    profile: string;
    settings: string;
  };
  
  // Wallet
  wallet: {
    connect: string;
    disconnect: string;
    connecting: string;
    connected: string;
    disconnected: string;
    address: string;
    balance: string;
    network: string;
    chainId: string;
    metamaskRequired: string;
    connectionRejected: string;
    networkError: string;
    instructions: string;
    instruction1: string;
    instruction2: string;
    instruction3: string;
    instruction4: string;
  };
  
  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    creditScore: string;
    lastUpdated: string;
    quickActions: string;
    viewScore: string;
    makePayment: string;
    chatWithAI: string;
    recentActivity: string;
    noActivity: string;
  };
  
  // Credit Score
  score: {
    title: string;
    currentScore: string;
    scoreRange: string;
    factors: string;
    paymentHistory: string;
    creditUtilization: string;
    creditAge: string;
    creditInquiries: string;
    publicRecords: string;
    accountTypes: string;
    paymentBehavior: string;
    financialStability: string;
    creditMix: string;
    improveScore: string;
    scoreHistory: string;
    recommendations: string;
  };
  
  // Payments
  payments: {
    title: string;
    upcoming: string;
    overdue: string;
    completed: string;
    amount: string;
    dueDate: string;
    status: string;
    payNow: string;
    viewDetails: string;
    noPayments: string;
    paymentSuccess: string;
    paymentFailed: string;
  };
  
  // Chat
  chat: {
    title: string;
    placeholder: string;
    send: string;
    typing: string;
    elizaos: string;
    user: string;
    newMessage: string;
    connecting: string;
    connected: string;
    disconnected: string;
  };
  
  // Profile
  profile: {
    title: string;
    personalInfo: string;
    kycStatus: string;
    verified: string;
    pending: string;
    rejected: string;
    editProfile: string;
    save: string;
    cancel: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    document: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    view: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    retry: string;
    refresh: string;
    search: string;
    filter: string;
    sort: string;
    date: string;
    time: string;
    amount: string;
    status: string;
    actions: string;
  };
  
  // Language Switcher
  language: {
    title: string;
    portuguese: string;
    english: string;
    spanish: string;
    selectLanguage: string;
  };
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    navigation: {
      dashboard: 'Dashboard',
      score: 'Score',
      payments: 'Pagamentos',
      chat: 'Chat',
      wallet: 'Carteira',
      profile: 'Perfil',
      settings: 'Configurações',
    },
    wallet: {
      connect: 'Conectar Carteira',
      disconnect: 'Desconectar',
      connecting: 'Conectando...',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      address: 'Endereço',
      balance: 'Saldo',
      network: 'Rede',
      chainId: 'Chain ID',
      metamaskRequired: 'MetaMask não está instalado. Por favor, instale a extensão MetaMask.',
      connectionRejected: 'Conexão rejeitada pelo usuário.',
      networkError: 'Erro ao trocar rede. Certifique-se de estar na Polkadot Hub TestNet.',
      instructions: 'Instruções:',
      instruction1: '1. Instale a extensão MetaMask',
      instruction2: '2. Clique em "Conectar Carteira"',
      instruction3: '3. Aprove a conexão no MetaMask',
      instruction4: '4. A rede será trocada automaticamente para Polkadot Hub TestNet',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Bem-vindo ao CredChain',
      creditScore: 'Score de Crédito',
      lastUpdated: 'Última atualização',
      quickActions: 'Ações Rápidas',
      viewScore: 'Ver Score',
      makePayment: 'Fazer Pagamento',
      chatWithAI: 'Chat com IA',
      recentActivity: 'Atividade Recente',
      noActivity: 'Nenhuma atividade recente',
    },
    score: {
      title: 'Score de Crédito',
      currentScore: 'Score Atual',
      scoreRange: 'Faixa de Score',
      factors: 'Fatores',
      paymentHistory: 'Histórico de Pagamentos',
      creditUtilization: 'Utilização de Crédito',
      creditAge: 'Idade do Crédito',
      creditInquiries: 'Consultas de Crédito',
      publicRecords: 'Registros Públicos',
      accountTypes: 'Tipos de Conta',
      paymentBehavior: 'Comportamento de Pagamento',
      financialStability: 'Estabilidade Financeira',
      creditMix: 'Mix de Crédito',
      improveScore: 'Melhorar Score',
      scoreHistory: 'Histórico de Score',
      recommendations: 'Recomendações',
    },
    payments: {
      title: 'Pagamentos',
      upcoming: 'Próximos',
      overdue: 'Em Atraso',
      completed: 'Concluídos',
      amount: 'Valor',
      dueDate: 'Vencimento',
      status: 'Status',
      payNow: 'Pagar Agora',
      viewDetails: 'Ver Detalhes',
      noPayments: 'Nenhum pagamento encontrado',
      paymentSuccess: 'Pagamento realizado com sucesso',
      paymentFailed: 'Falha no pagamento',
    },
    chat: {
      title: 'Chat com ElizaOS',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar',
      typing: 'Digitando...',
      elizaos: 'ElizaOS',
      user: 'Você',
      newMessage: 'Nova mensagem',
      connecting: 'Conectando...',
      connected: 'Conectado',
      disconnected: 'Desconectado',
    },
    profile: {
      title: 'Perfil',
      personalInfo: 'Informações Pessoais',
      kycStatus: 'Status KYC',
      verified: 'Verificado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
      editProfile: 'Editar Perfil',
      save: 'Salvar',
      cancel: 'Cancelar',
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      address: 'Endereço',
      document: 'Documento',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      view: 'Visualizar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      open: 'Abrir',
      yes: 'Sim',
      no: 'Não',
      retry: 'Tentar Novamente',
      refresh: 'Atualizar',
      search: 'Pesquisar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      date: 'Data',
      time: 'Hora',
      amount: 'Valor',
      status: 'Status',
      actions: 'Ações',
    },
    language: {
      title: 'Idioma',
      portuguese: 'Português (BR)',
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Selecionar Idioma',
    },
  },
  'en': {
    navigation: {
      dashboard: 'Dashboard',
      score: 'Score',
      payments: 'Payments',
      chat: 'Chat',
      wallet: 'Wallet',
      profile: 'Profile',
      settings: 'Settings',
    },
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      address: 'Address',
      balance: 'Balance',
      network: 'Network',
      chainId: 'Chain ID',
      metamaskRequired: 'MetaMask is not installed. Please install the MetaMask extension.',
      connectionRejected: 'Connection rejected by user.',
      networkError: 'Error switching network. Make sure you are on Polkadot Hub TestNet.',
      instructions: 'Instructions:',
      instruction1: '1. Install MetaMask extension',
      instruction2: '2. Click "Connect Wallet"',
      instruction3: '3. Approve connection in MetaMask',
      instruction4: '4. Network will be automatically switched to Polkadot Hub TestNet',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Welcome to CredChain',
      creditScore: 'Credit Score',
      lastUpdated: 'Last updated',
      quickActions: 'Quick Actions',
      viewScore: 'View Score',
      makePayment: 'Make Payment',
      chatWithAI: 'Chat with AI',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
    },
    score: {
      title: 'Credit Score',
      currentScore: 'Current Score',
      scoreRange: 'Score Range',
      factors: 'Factors',
      paymentHistory: 'Payment History',
      creditUtilization: 'Credit Utilization',
      creditAge: 'Credit Age',
      creditInquiries: 'Credit Inquiries',
      publicRecords: 'Public Records',
      accountTypes: 'Account Types',
      paymentBehavior: 'Payment Behavior',
      financialStability: 'Financial Stability',
      creditMix: 'Credit Mix',
      improveScore: 'Improve Score',
      scoreHistory: 'Score History',
      recommendations: 'Recommendations',
    },
    payments: {
      title: 'Payments',
      upcoming: 'Upcoming',
      overdue: 'Overdue',
      completed: 'Completed',
      amount: 'Amount',
      dueDate: 'Due Date',
      status: 'Status',
      payNow: 'Pay Now',
      viewDetails: 'View Details',
      noPayments: 'No payments found',
      paymentSuccess: 'Payment successful',
      paymentFailed: 'Payment failed',
    },
    chat: {
      title: 'Chat with ElizaOS',
      placeholder: 'Type your message...',
      send: 'Send',
      typing: 'Typing...',
      elizaos: 'ElizaOS',
      user: 'You',
      newMessage: 'New message',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
    },
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      kycStatus: 'KYC Status',
      verified: 'Verified',
      pending: 'Pending',
      rejected: 'Rejected',
      editProfile: 'Edit Profile',
      save: 'Save',
      cancel: 'Cancel',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      document: 'Document',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      retry: 'Retry',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      date: 'Date',
      time: 'Time',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
    },
    language: {
      title: 'Language',
      portuguese: 'Português (BR)',
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Select Language',
    },
  },
  'es': {
    navigation: {
      dashboard: 'Panel',
      score: 'Puntuación',
      payments: 'Pagos',
      chat: 'Chat',
      wallet: 'Cartera',
      profile: 'Perfil',
      settings: 'Configuración',
    },
    wallet: {
      connect: 'Conectar Cartera',
      disconnect: 'Desconectar',
      connecting: 'Conectando...',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      address: 'Dirección',
      balance: 'Saldo',
      network: 'Red',
      chainId: 'Chain ID',
      metamaskRequired: 'MetaMask no está instalado. Por favor, instale la extensión MetaMask.',
      connectionRejected: 'Conexión rechazada por el usuario.',
      networkError: 'Error al cambiar de red. Asegúrese de estar en Polkadot Hub TestNet.',
      instructions: 'Instrucciones:',
      instruction1: '1. Instale la extensión MetaMask',
      instruction2: '2. Haga clic en "Conectar Cartera"',
      instruction3: '3. Apruebe la conexión en MetaMask',
      instruction4: '4. La red se cambiará automáticamente a Polkadot Hub TestNet',
    },
    dashboard: {
      title: 'Panel',
      subtitle: 'Bienvenido a CredChain',
      creditScore: 'Puntuación de Crédito',
      lastUpdated: 'Última actualización',
      quickActions: 'Acciones Rápidas',
      viewScore: 'Ver Puntuación',
      makePayment: 'Realizar Pago',
      chatWithAI: 'Chat con IA',
      recentActivity: 'Actividad Reciente',
      noActivity: 'Sin actividad reciente',
    },
    score: {
      title: 'Puntuación de Crédito',
      currentScore: 'Puntuación Actual',
      scoreRange: 'Rango de Puntuación',
      factors: 'Factores',
      paymentHistory: 'Historial de Pagos',
      creditUtilization: 'Utilización de Crédito',
      creditAge: 'Edad del Crédito',
      creditInquiries: 'Consultas de Crédito',
      publicRecords: 'Registros Públicos',
      accountTypes: 'Tipos de Cuenta',
      paymentBehavior: 'Comportamiento de Pago',
      financialStability: 'Estabilidad Financiera',
      creditMix: 'Mix de Crédito',
      improveScore: 'Mejorar Puntuación',
      scoreHistory: 'Historial de Puntuación',
      recommendations: 'Recomendaciones',
    },
    payments: {
      title: 'Pagos',
      upcoming: 'Próximos',
      overdue: 'Vencidos',
      completed: 'Completados',
      amount: 'Monto',
      dueDate: 'Fecha de Vencimiento',
      status: 'Estado',
      payNow: 'Pagar Ahora',
      viewDetails: 'Ver Detalles',
      noPayments: 'No se encontraron pagos',
      paymentSuccess: 'Pago exitoso',
      paymentFailed: 'Pago fallido',
    },
    chat: {
      title: 'Chat con ElizaOS',
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      typing: 'Escribiendo...',
      elizaos: 'ElizaOS',
      user: 'Tú',
      newMessage: 'Nuevo mensaje',
      connecting: 'Conectando...',
      connected: 'Conectado',
      disconnected: 'Desconectado',
    },
    profile: {
      title: 'Perfil',
      personalInfo: 'Información Personal',
      kycStatus: 'Estado KYC',
      verified: 'Verificado',
      pending: 'Pendiente',
      rejected: 'Rechazado',
      editProfile: 'Editar Perfil',
      save: 'Guardar',
      cancel: 'Cancelar',
      name: 'Nombre',
      email: 'Correo',
      phone: 'Teléfono',
      address: 'Dirección',
      document: 'Documento',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      view: 'Ver',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      open: 'Abrir',
      yes: 'Sí',
      no: 'No',
      retry: 'Reintentar',
      refresh: 'Actualizar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      date: 'Fecha',
      time: 'Hora',
      amount: 'Monto',
      status: 'Estado',
      actions: 'Acciones',
    },
    language: {
      title: 'Idioma',
      portuguese: 'Português (BR)',
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Seleccionar Idioma',
    },
  },
};

export const getTranslations = (language: Language): Translations => {
  return translations[language];
};

export const getSupportedLanguages = (): Language[] => {
  return ['pt-BR', 'en', 'es'];
};

export const getLanguageName = (language: Language): string => {
  const names = {
    'pt-BR': 'Português (BR)',
    'en': 'English',
    'es': 'Español',
  };
  return names[language];
};
