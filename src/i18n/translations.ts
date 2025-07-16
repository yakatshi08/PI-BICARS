// Système de traduction pour PI BICARS
export const translations = {
  fr: {
    // Informations de l'application
    appName: 'PI BICARS',
    appDescription: 'Plateforme d\'Intelligence Finance & Assurance',
    
    // Secteurs
    sectors: {
      all: 'Tous',
      banking: 'Banque',
      insurance: 'Assurance'
    },
    
    // Profils
    profiles: {
      banker: 'Banquier',
      actuary: 'Actuaire',
      riskManager: 'Risk Manager',
      cfo: 'Directeur Financier'
    },
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',  // ✅ MODIFIÉ : était 'Tableau de bord'
      import: 'Import de données',
      bankingCore: 'Module Bancaire',
      insuranceCore: 'Module Assurance',
      coPilot: 'Co-Pilot IA',
      analytics: 'Analyses',
      risk: 'Gestion des Risques',
      reports: 'Rapports',
      settings: 'Paramètres',
      analyticsML: 'Analytics ML',
      creditRisk: 'Risque de Crédit'
    }
  },
  
  en: {
    // Application info
    appName: 'PI BICARS',
    appDescription: 'Finance & Insurance Intelligence Platform',
    
    // Sectors
    sectors: {
      all: 'All',
      banking: 'Banking',
      insurance: 'Insurance'
    },
    
    // Profiles
    profiles: {
      banker: 'Banker',
      actuary: 'Actuary',
      riskManager: 'Risk Manager',
      cfo: 'CFO'
    },
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      import: 'Data Import',
      bankingCore: 'Banking Core',
      insuranceCore: 'Insurance Core',
      coPilot: 'Co-Pilot AI',
      analytics: 'Analytics',
      risk: 'Risk Management',
      reports: 'Reports',
      settings: 'Settings',
      analyticsML: 'Analytics ML',
      creditRisk: 'Credit Risk'
    }
  },
  
  de: {
    // Anwendungsinformationen
    appName: 'PI BICARS',
    appDescription: 'Plattform für Finanz- & Versicherungsintelligenz',
    
    // Sektoren
    sectors: {
      all: 'Alle',
      banking: 'Banken',
      insurance: 'Versicherung'
    },
    
    // Profile
    profiles: {
      banker: 'Banker',
      actuary: 'Aktuar',
      riskManager: 'Risikomanager',
      cfo: 'Finanzvorstand'
    },
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      import: 'Datenimport',
      bankingCore: 'Banking-Modul',
      insuranceCore: 'Versicherungsmodul',
      coPilot: 'Co-Pilot KI',
      analytics: 'Analysen',
      risk: 'Risikomanagement',
      reports: 'Berichte',
      settings: 'Einstellungen',
      analyticsML: 'Analytics ML',
      creditRisk: 'Kreditrisiko'
    }
  },
  
  es: {
    // Información de la aplicación
    appName: 'PI BICARS',
    appDescription: 'Plataforma de Inteligencia Financiera y de Seguros',
    
    // Sectores
    sectors: {
      all: 'Todos',
      banking: 'Banca',
      insurance: 'Seguros'
    },
    
    // Perfiles
    profiles: {
      banker: 'Banquero',
      actuary: 'Actuario',
      riskManager: 'Gestor de Riesgos',
      cfo: 'Director Financiero'
    },
    
    // Navegación
    nav: {
      dashboard: 'Panel de Control',
      import: 'Importar Datos',
      bankingCore: 'Módulo Bancario',
      insuranceCore: 'Módulo de Seguros',
      coPilot: 'Co-Pilot IA',
      analytics: 'Análisis',
      risk: 'Gestión de Riesgos',
      reports: 'Informes',
      settings: 'Configuración',
      analyticsML: 'Analytics ML',
      creditRisk: 'Riesgo Crediticio'
    }
  },
  
  it: {
    // Informazioni sull'applicazione
    appName: 'PI BICARS',
    appDescription: 'Piattaforma di Intelligence Finanziaria e Assicurativa',
    
    // Settori
    sectors: {
      all: 'Tutti',
      banking: 'Banca',
      insurance: 'Assicurazione'
    },
    
    // Profili
    profiles: {
      banker: 'Banchiere',
      actuary: 'Attuario',
      riskManager: 'Risk Manager',
      cfo: 'Direttore Finanziario'
    },
    
    // Navigazione
    nav: {
      dashboard: 'Cruscotto',
      import: 'Importa Dati',
      bankingCore: 'Modulo Bancario',
      insuranceCore: 'Modulo Assicurativo',
      coPilot: 'Co-Pilot IA',
      analytics: 'Analisi',
      risk: 'Gestione Rischi',
      reports: 'Rapporti',
      settings: 'Impostazioni',
      analyticsML: 'Analytics ML',
      creditRisk: 'Rischio di Credito'
    }
  },
  
  pt: {
    // Informações do aplicativo
    appName: 'PI BICARS',
    appDescription: 'Plataforma de Inteligência Financeira e de Seguros',
    
    // Setores
    sectors: {
      all: 'Todos',
      banking: 'Banco',
      insurance: 'Seguro'
    },
    
    // Perfis
    profiles: {
      banker: 'Banqueiro',
      actuary: 'Atuário',
      riskManager: 'Gestor de Riscos',
      cfo: 'Diretor Financeiro'
    },
    
    // Navegação
    nav: {
      dashboard: 'Painel de Controle',
      import: 'Importar Dados',
      bankingCore: 'Módulo Bancário',
      insuranceCore: 'Módulo de Seguros',
      coPilot: 'Co-Pilot IA',
      analytics: 'Análises',
      risk: 'Gestão de Riscos',
      reports: 'Relatórios',
      settings: 'Configurações',
      analyticsML: 'Analytics ML',
      creditRisk: 'Risco de Crédito'
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;