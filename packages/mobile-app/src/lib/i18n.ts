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
