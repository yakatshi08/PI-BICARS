import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions directement intégrées pour éviter les erreurs d'import
const resources = {
  fr: {
    translation: {
      common: {
        loading: "Chargement",
        save: "Enregistrer",
        cancel: "Annuler",
        export: "Exporter",
        refresh: "Actualiser",
        search: "Rechercher",
        filter: "Filtrer",
        download: "Télécharger",
        print: "Imprimer",
        delete: "Supprimer",
        edit: "Modifier",
        view: "Voir",
        close: "Fermer",
        confirm: "Confirmer",
        back: "Retour",
        next: "Suivant",
        previous: "Précédent",
        yes: "Oui",
        no: "Non",
        error: "Erreur",
        success: "Succès",
        warning: "Attention",
        info: "Information"
      },
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de Bord",
        insurance: "Module Assurance",
        banking: "Module Bancaire",
        claims: "Sinistres & Souscription",
        actuarial: "Module Actuariel",
        riskAnalysis: "Analyse des Risques",
        regulatory: "Conformité Réglementaire",
        reports: "Rapports",
        settings: "Paramètres",
        help: "Aide",
        logout: "Déconnexion"
      },
      dashboard: {
        title: "Tableau de Bord",
        subtitle: "Conforme aux normes Bâle III et Solvency II",
        lastUpdate: "Dernière mise à jour : {{time}}",
        toggleBanking: "Bancaire",
        toggleInsurance: "Assurance",
        kpis: {
          tier1: {
            title: "Tier 1 Ratio",
            value: "{{value}}%",
            status: "Conforme",
            trend: "{{trend}}% vs mois dernier",
            description: "Capital de base / Actifs pondérés"
          },
          liquidity: {
            title: "Ratio de Liquidité (LCR)",
            value: "{{value}}%",
            status: "Optimal",
            trend: "{{trend}}% variation",
            description: "Actifs liquides / Sorties nettes"
          },
          scr: {
            title: "Ratio de Solvabilité (SCR)",
            value: "{{value}}%",
            status: "Au-dessus du minimum",
            trend: "{{trend}}% évolution",
            description: "Fonds propres / SCR requis"
          },
          combined: {
            title: "Ratio Combiné",
            value: "{{value}}%",
            status: "Rentable",
            trend: "{{trend}}% performance",
            description: "Sinistres + Frais / Primes"
          },
          npl: {
            title: "NPL Ratio",
            value: "{{value}}%",
            status: "Sous contrôle",
            trend: "{{trend}}% amélioration",
            description: "Prêts non performants / Total prêts"
          },
          mcr: {
            title: "MCR Coverage",
            value: "{{value}}%",
            status: "Conforme",
            trend: "Stable",
            description: "Fonds propres / MCR minimum"
          }
        },
        creditRisk: {
          title: "Risque de Crédit - Analyse Temps Réel",
          pd: "Probabilité de Défaut",
          lgd: "Perte en Cas de Défaut",
          ead: "Exposition au Défaut",
          ecl: "Pertes Attendues",
          avgPd: "PD Moyenne: {{value}}%",
          avgLgd: "LGD Moyenne: {{value}}%",
          totalEcl: "ECL Total: {{value}}M€",
          portfolioHealth: "Santé du Portefeuille",
          riskDistribution: "Distribution des Risques",
          expectedLoss: "Pertes Attendues",
          unexpectedLoss: "Pertes Inattendues",
          economicCapital: "Capital Économique",
          regulatoryCapital: "Capital Réglementaire"
        },
        dataImport: {
          title: "Import de Données Intelligent",
          dragDrop: "Glissez-déposez vos fichiers ici",
          or: "ou",
          browse: "Parcourir",
          formats: "Formats: Excel, CSV, JSON, PDF",
          detecting: "Détection du type de données...",
          success: "Import réussi !",
          error: "Erreur lors de l'import",
          processing: "Traitement en cours...",
          validation: "Validation des données...",
          mapping: "Mapping automatique...",
          complete: "Import terminé"
        },
        actions: {
          exportPDF: "Exporter en PDF",
          exportExcel: "Exporter en Excel",
          schedule: "Planifier",
          share: "Partager",
          fullscreen: "Plein écran"
        }
      },
      claims: {
        title: "Claims & Underwriting Intelligence",
        subtitle: "Détection de fraude, prédiction des coûts et optimisation du pricing",
        metrics: {
          fraudRate: {
            title: "Taux de Fraude Détecté",
            value: "{{value}}%",
            description: "{{count}} sinistres suspects sur {{total}}"
          },
          savings: {
            title: "Économies Réalisées",
            value: "{{value}} €",
            description: "Fraudes évitées ce mois"
          },
          mlAccuracy: {
            title: "Précision ML",
            value: "{{value}}%",
            description: "Accuracy du modèle de détection"
          },
          processingTime: {
            title: "Temps Traitement",
            value: "{{value}}h",
            description: "Temps moyen par dossier"
          }
        },
        tabs: {
          fraudDetection: "Détection de Fraude",
          costPrediction: "Prédiction des Coûts",
          pricingOptimization: "Optimisation Pricing",
          adverseSelection: "Sélection Adverse"
        },
        actions: {
          refresh: "Actualiser",
          exportReport: "Export Rapport",
          configure: "Configurer",
          analyze: "Analyser",
          validate: "Valider"
        },
        timeRange: {
          lastDays: "{{count}} derniers jours",
          lastMonth: "Dernier mois",
          lastQuarter: "Dernier trimestre",
          lastYear: "Dernière année",
          custom: "Période personnalisée"
        }
      },
      settings: {
        title: "Paramètres",
        language: "Langue",
        theme: "Thème",
        darkMode: "Mode sombre",
        lightMode: "Mode clair",
        dataRetention: "Rétention des données",
        exportFormat: "Format d'export par défaut",
        notifications: "Notifications",
        security: "Sécurité",
        privacy: "Confidentialité",
        accessibility: "Accessibilité",
        performance: "Performance",
        advanced: "Paramètres avancés"
      }
    }
  },
  en: {
    translation: {
      common: {
        loading: "Loading",
        save: "Save",
        cancel: "Cancel",
        export: "Export",
        refresh: "Refresh",
        search: "Search",
        filter: "Filter",
        download: "Download",
        print: "Print",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        close: "Close",
        confirm: "Confirm",
        back: "Back",
        next: "Next",
        previous: "Previous",
        yes: "Yes",
        no: "No",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information"
      },
      navigation: {
        home: "Home",
        dashboard: "Dashboard",
        insurance: "Insurance Module",
        banking: "Banking Module",
        claims: "Claims & Underwriting",
        actuarial: "Actuarial Module",
        riskAnalysis: "Risk Analysis",
        regulatory: "Regulatory Compliance",
        reports: "Reports",
        settings: "Settings",
        help: "Help",
        logout: "Logout"
      },
      dashboard: {
        title: "Dashboard",
        subtitle: "Basel III and Solvency II compliant",
        lastUpdate: "Last update: {{time}}",
        toggleBanking: "Banking",
        toggleInsurance: "Insurance",
        kpis: {
          tier1: {
            title: "Tier 1 Ratio",
            value: "{{value}}%",
            status: "Compliant",
            trend: "{{trend}}% vs last month",
            description: "Core capital / Risk-weighted assets"
          },
          liquidity: {
            title: "Liquidity Coverage Ratio (LCR)",
            value: "{{value}}%",
            status: "Optimal",
            trend: "{{trend}}% change",
            description: "Liquid assets / Net cash outflows"
          },
          scr: {
            title: "Solvency Capital Requirement (SCR)",
            value: "{{value}}%",
            status: "Above minimum",
            trend: "{{trend}}% evolution",
            description: "Own funds / Required SCR"
          },
          combined: {
            title: "Combined Ratio",
            value: "{{value}}%",
            status: "Profitable",
            trend: "{{trend}}% performance",
            description: "Claims + Expenses / Premiums"
          },
          npl: {
            title: "NPL Ratio",
            value: "{{value}}%",
            status: "Under control",
            trend: "{{trend}}% improvement",
            description: "Non-performing loans / Total loans"
          },
          mcr: {
            title: "MCR Coverage",
            value: "{{value}}%",
            status: "Compliant",
            trend: "Stable",
            description: "Own funds / Minimum MCR"
          }
        },
        creditRisk: {
          title: "Credit Risk - Real-time Analysis",
          pd: "Probability of Default",
          lgd: "Loss Given Default",
          ead: "Exposure at Default",
          ecl: "Expected Credit Loss",
          avgPd: "Average PD: {{value}}%",
          avgLgd: "Average LGD: {{value}}%",
          totalEcl: "Total ECL: {{value}}M€",
          portfolioHealth: "Portfolio Health",
          riskDistribution: "Risk Distribution",
          expectedLoss: "Expected Loss",
          unexpectedLoss: "Unexpected Loss",
          economicCapital: "Economic Capital",
          regulatoryCapital: "Regulatory Capital"
        },
        dataImport: {
          title: "Smart Data Import",
          dragDrop: "Drag and drop your files here",
          or: "or",
          browse: "Browse",
          formats: "Formats: Excel, CSV, JSON, PDF",
          detecting: "Detecting data type...",
          success: "Import successful!",
          error: "Import error",
          processing: "Processing...",
          validation: "Validating data...",
          mapping: "Auto-mapping...",
          complete: "Import complete"
        },
        actions: {
          exportPDF: "Export as PDF",
          exportExcel: "Export as Excel",
          schedule: "Schedule",
          share: "Share",
          fullscreen: "Fullscreen"
        }
      },
      claims: {
        title: "Claims & Underwriting Intelligence",
        subtitle: "Fraud detection, cost prediction and pricing optimization",
        metrics: {
          fraudRate: {
            title: "Fraud Detection Rate",
            value: "{{value}}%",
            description: "{{count}} suspicious claims out of {{total}}"
          },
          savings: {
            title: "Realized Savings",
            value: "{{value}} €",
            description: "Fraud prevented this month"
          },
          mlAccuracy: {
            title: "ML Accuracy",
            value: "{{value}}%",
            description: "Detection model accuracy"
          },
          processingTime: {
            title: "Processing Time",
            value: "{{value}}h",
            description: "Average time per file"
          }
        },
        tabs: {
          fraudDetection: "Fraud Detection",
          costPrediction: "Cost Prediction",
          pricingOptimization: "Pricing Optimization",
          adverseSelection: "Adverse Selection"
        },
        actions: {
          refresh: "Refresh",
          exportReport: "Export Report",
          configure: "Configure",
          analyze: "Analyze",
          validate: "Validate"
        },
        timeRange: {
          lastDays: "Last {{count}} days",
          lastMonth: "Last month",
          lastQuarter: "Last quarter",
          lastYear: "Last year",
          custom: "Custom period"
        }
      },
      settings: {
        title: "Settings",
        language: "Language",
        theme: "Theme",
        darkMode: "Dark mode",
        lightMode: "Light mode",
        dataRetention: "Data retention",
        exportFormat: "Default export format",
        notifications: "Notifications",
        security: "Security",
        privacy: "Privacy",
        accessibility: "Accessibility",
        performance: "Performance",
        advanced: "Advanced settings"
      }
    }
  },
  it: {
    translation: {
      common: {
        loading: "Caricamento",
        save: "Salva",
        cancel: "Annulla",
        export: "Esporta",
        refresh: "Aggiorna",
        search: "Cerca",
        filter: "Filtra",
        download: "Scarica",
        print: "Stampa",
        delete: "Elimina",
        edit: "Modifica",
        view: "Visualizza",
        close: "Chiudi",
        confirm: "Conferma",
        back: "Indietro",
        next: "Avanti",
        previous: "Precedente",
        yes: "Sì",
        no: "No",
        error: "Errore",
        success: "Successo",
        warning: "Attenzione",
        info: "Informazione"
      },
      navigation: {
        home: "Home",
        dashboard: "Dashboard",
        insurance: "Modulo Assicurativo",
        banking: "Modulo Bancario",
        claims: "Sinistri & Sottoscrizione",
        actuarial: "Modulo Attuariale",
        riskAnalysis: "Analisi dei Rischi",
        regulatory: "Conformità Normativa",
        reports: "Rapporti",
        settings: "Impostazioni",
        help: "Aiuto",
        logout: "Esci"
      },
      dashboard: {
        title: "Dashboard",
        subtitle: "Conforme a Basilea III e Solvency II",
        lastUpdate: "Ultimo aggiornamento: {{time}}",
        toggleBanking: "Bancario",
        toggleInsurance: "Assicurativo",
        kpis: {
          tier1: {
            title: "Tier 1 Ratio",
            value: "{{value}}%",
            status: "Conforme",
            trend: "{{trend}}% vs mese scorso",
            description: "Capitale di base / Attivi ponderati"
          },
          liquidity: {
            title: "Indice di Liquidità (LCR)",
            value: "{{value}}%",
            status: "Ottimale",
            trend: "{{trend}}% variazione",
            description: "Attivi liquidi / Deflussi netti"
          },
          scr: {
            title: "Requisito di Capitale (SCR)",
            value: "{{value}}%",
            status: "Sopra il minimo",
            trend: "{{trend}}% evoluzione",
            description: "Fondi propri / SCR richiesto"
          },
          combined: {
            title: "Combined Ratio",
            value: "{{value}}%",
            status: "Redditizio",
            trend: "{{trend}}% performance",
            description: "Sinistri + Spese / Premi"
          },
          npl: {
            title: "NPL Ratio",
            value: "{{value}}%",
            status: "Sotto controllo",
            trend: "{{trend}}% miglioramento",
            description: "Crediti deteriorati / Totale prestiti"
          },
          mcr: {
            title: "Copertura MCR",
            value: "{{value}}%",
            status: "Conforme",
            trend: "Stabile",
            description: "Fondi propri / MCR minimo"
          }
        },
        creditRisk: {
          title: "Rischio di Credito - Analisi in Tempo Reale",
          pd: "Probabilità di Default",
          lgd: "Perdita in Caso di Default",
          ead: "Esposizione al Default",
          ecl: "Perdite Attese",
          avgPd: "PD Media: {{value}}%",
          avgLgd: "LGD Media: {{value}}%",
          totalEcl: "ECL Totale: {{value}}M€",
          portfolioHealth: "Salute del Portafoglio",
          riskDistribution: "Distribuzione del Rischio",
          expectedLoss: "Perdite Attese",
          unexpectedLoss: "Perdite Inattese",
          economicCapital: "Capitale Economico",
          regulatoryCapital: "Capitale Regolamentare"
        },
        dataImport: {
          title: "Importazione Dati Intelligente",
          dragDrop: "Trascina i file qui",
          or: "o",
          browse: "Sfoglia",
          formats: "Formati: Excel, CSV, JSON, PDF",
          detecting: "Rilevamento tipo di dati...",
          success: "Importazione riuscita!",
          error: "Errore di importazione",
          processing: "Elaborazione...",
          validation: "Validazione dati...",
          mapping: "Mappatura automatica...",
          complete: "Importazione completata"
        },
        actions: {
          exportPDF: "Esporta in PDF",
          exportExcel: "Esporta in Excel",
          schedule: "Pianifica",
          share: "Condividi",
          fullscreen: "Schermo intero"
        }
      },
      claims: {
        title: "Intelligence Sinistri & Sottoscrizione",
        subtitle: "Rilevamento frodi, previsione costi e ottimizzazione pricing",
        metrics: {
          fraudRate: {
            title: "Tasso di Frode Rilevato",
            value: "{{value}}%",
            description: "{{count}} sinistri sospetti su {{total}}"
          },
          savings: {
            title: "Risparmi Realizzati",
            value: "{{value}} €",
            description: "Frodi evitate questo mese"
          },
          mlAccuracy: {
            title: "Precisione ML",
            value: "{{value}}%",
            description: "Accuratezza del modello di rilevamento"
          },
          processingTime: {
            title: "Tempo di Elaborazione",
            value: "{{value}}h",
            description: "Tempo medio per pratica"
          }
        },
        tabs: {
          fraudDetection: "Rilevamento Frodi",
          costPrediction: "Previsione Costi",
          pricingOptimization: "Ottimizzazione Pricing",
          adverseSelection: "Selezione Avversa"
        },
        actions: {
          refresh: "Aggiorna",
          exportReport: "Esporta Rapporto",
          configure: "Configura",
          analyze: "Analizza",
          validate: "Valida"
        },
        timeRange: {
          lastDays: "Ultimi {{count}} giorni",
          lastMonth: "Ultimo mese",
          lastQuarter: "Ultimo trimestre",
          lastYear: "Ultimo anno",
          custom: "Periodo personalizzato"
        }
      },
      settings: {
        title: "Impostazioni",
        language: "Lingua",
        theme: "Tema",
        darkMode: "Modalità scura",
        lightMode: "Modalità chiara",
        dataRetention: "Conservazione dati",
        exportFormat: "Formato di esportazione predefinito",
        notifications: "Notifiche",
        security: "Sicurezza",
        privacy: "Privacy",
        accessibility: "Accessibilità",
        performance: "Prestazioni",
        advanced: "Impostazioni avanzate"
      }
    }
  },
  pt: {
    translation: {
      common: {
        loading: "Carregando",
        save: "Salvar",
        cancel: "Cancelar",
        export: "Exportar",
        refresh: "Atualizar",
        search: "Pesquisar",
        filter: "Filtrar",
        download: "Baixar",
        print: "Imprimir",
        delete: "Excluir",
        edit: "Editar",
        view: "Visualizar",
        close: "Fechar",
        confirm: "Confirmar",
        back: "Voltar",
        next: "Próximo",
        previous: "Anterior",
        yes: "Sim",
        no: "Não",
        error: "Erro",
        success: "Sucesso",
        warning: "Aviso",
        info: "Informação"
      },
      navigation: {
        home: "Início",
        dashboard: "Painel",
        insurance: "Módulo de Seguros",
        banking: "Módulo Bancário",
        claims: "Sinistros & Subscrição",
        actuarial: "Módulo Atuarial",
        riskAnalysis: "Análise de Riscos",
        regulatory: "Conformidade Regulatória",
        reports: "Relatórios",
        settings: "Configurações",
        help: "Ajuda",
        logout: "Sair"
      },
      dashboard: {
        title: "Painel de Controle",
        subtitle: "Conforme Basileia III e Solvência II",
        lastUpdate: "Última atualização: {{time}}",
        toggleBanking: "Bancário",
        toggleInsurance: "Seguros",
        kpis: {
          tier1: {
            title: "Índice Tier 1",
            value: "{{value}}%",
            status: "Conforme",
            trend: "{{trend}}% vs mês passado",
            description: "Capital base / Ativos ponderados"
          },
          liquidity: {
            title: "Índice de Liquidez (LCR)",
            value: "{{value}}%",
            status: "Ótimo",
            trend: "{{trend}}% mudança",
            description: "Ativos líquidos / Saídas líquidas"
          },
          scr: {
            title: "Requisito de Capital (SCR)",
            value: "{{value}}%",
            status: "Acima do mínimo",
            trend: "{{trend}}% evolução",
            description: "Fundos próprios / SCR requerido"
          },
          combined: {
            title: "Índice Combinado",
            value: "{{value}}%",
            status: "Lucrativo",
            trend: "{{trend}}% desempenho",
            description: "Sinistros + Despesas / Prêmios"
          },
          npl: {
            title: "Índice NPL",
            value: "{{value}}%",
            status: "Sob controle",
            trend: "{{trend}}% melhoria",
            description: "Empréstimos inadimplentes / Total"
          },
          mcr: {
            title: "Cobertura MCR",
            value: "{{value}}%",
            status: "Conforme",
            trend: "Estável",
            description: "Fundos próprios / MCR mínimo"
          }
        },
        creditRisk: {
          title: "Risco de Crédito - Análise em Tempo Real",
          pd: "Probabilidade de Inadimplência",
          lgd: "Perda Dada a Inadimplência",
          ead: "Exposição na Inadimplência",
          ecl: "Perdas de Crédito Esperadas",
          avgPd: "PD Média: {{value}}%",
          avgLgd: "LGD Média: {{value}}%",
          totalEcl: "ECL Total: {{value}}M€",
          portfolioHealth: "Saúde da Carteira",
          riskDistribution: "Distribuição de Risco",
          expectedLoss: "Perdas Esperadas",
          unexpectedLoss: "Perdas Inesperadas",
          economicCapital: "Capital Econômico",
          regulatoryCapital: "Capital Regulatório"
        },
        dataImport: {
          title: "Importação Inteligente de Dados",
          dragDrop: "Arraste e solte seus arquivos aqui",
          or: "ou",
          browse: "Procurar",
          formats: "Formatos: Excel, CSV, JSON, PDF",
          detecting: "Detectando tipo de dados...",
          success: "Importação bem-sucedida!",
          error: "Erro na importação",
          processing: "Processando...",
          validation: "Validando dados...",
          mapping: "Mapeamento automático...",
          complete: "Importação concluída"
        },
        actions: {
          exportPDF: "Exportar como PDF",
          exportExcel: "Exportar como Excel",
          schedule: "Agendar",
          share: "Compartilhar",
          fullscreen: "Tela cheia"
        }
      },
      claims: {
        title: "Inteligência de Sinistros & Subscrição",
        subtitle: "Detecção de fraude, previsão de custos e otimização de preços",
        metrics: {
          fraudRate: {
            title: "Taxa de Fraude Detectada",
            value: "{{value}}%",
            description: "{{count}} sinistros suspeitos de {{total}}"
          },
          savings: {
            title: "Economias Realizadas",
            value: "{{value}} €",
            description: "Fraudes evitadas este mês"
          },
          mlAccuracy: {
            title: "Precisão ML",
            value: "{{value}}%",
            description: "Precisão do modelo de detecção"
          },
          processingTime: {
            title: "Tempo de Processamento",
            value: "{{value}}h",
            description: "Tempo médio por processo"
          }
        },
        tabs: {
          fraudDetection: "Detecção de Fraude",
          costPrediction: "Previsão de Custos",
          pricingOptimization: "Otimização de Preços",
          adverseSelection: "Seleção Adversa"
        },
        actions: {
          refresh: "Atualizar",
          exportReport: "Exportar Relatório",
          configure: "Configurar",
          analyze: "Analisar",
          validate: "Validar"
        },
        timeRange: {
          lastDays: "Últimos {{count}} dias",
          lastMonth: "Último mês",
          lastQuarter: "Último trimestre",
          lastYear: "Último ano",
          custom: "Período personalizado"
        }
      },
      settings: {
        title: "Configurações",
        language: "Idioma",
        theme: "Tema",
        darkMode: "Modo escuro",
        lightMode: "Modo claro",
        dataRetention: "Retenção de dados",
        exportFormat: "Formato de exportação padrão",
        notifications: "Notificações",
        security: "Segurança",
        privacy: "Privacidade",
        accessibility: "Acessibilidade",
        performance: "Desempenho",
        advanced: "Configurações avançadas"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    
    interpolation: {
      escapeValue: false,
      format: function(value, format, lng) {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'EUR'
          }).format(value);
        }
        if (format === 'percent') {
          return new Intl.NumberFormat(lng, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
          }).format(value / 100);
        }
        return value;
      }
    },
    
    react: {
      useSuspense: true,
    }
  });

// Helper pour formater les dates
export const formatDate = (date: Date, lng: string): string => {
  return new Intl.DateTimeFormat(lng, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Helper pour formater les heures
export const formatTime = (date: Date, lng: string): string => {
  return new Intl.DateTimeFormat(lng, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper pour formater les devises
export const formatCurrency = (value: number, lng: string, currency = 'EUR'): string => {
  return new Intl.NumberFormat(lng, {
    style: 'currency',
    currency: currency
  }).format(value);
};

export default i18n;