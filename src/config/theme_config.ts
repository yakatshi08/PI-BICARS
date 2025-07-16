// app/config/theme_config.ts
/**
 * Configuration des couleurs selon le cahier des charges FINTECH V4.1
 * Palette PI BICARS - Insurance Core Module
 * 
 * NE PAS MODIFIER - Couleurs strictement définies dans le cahier des charges
 */

export const FINTECH_THEME = {
  // 🟫 1. Couleurs de fond
  background: {
    primary: '#0f172a',    // Fond principal/général (slate-900)
    secondary: '#1e293b',  // Cartes/blocs secondaires (slate-800)
  },
  
  // ✍️ 2. Couleurs des textes
  text: {
    primary: '#ffffff',    // Texte principal/titres (white)
    secondary: '#94a3b8',  // Texte secondaire/sous-titres (slate-400)
    positive: '#10b981',   // Indicateur positif (+8%) (emerald-500)
    negative: '#ef4444',   // Indicateur négatif (-2.1%) (red-500)
  },
  
  // 🟪 3. Couleurs des icônes
  icons: {
    security: '#8b5cf6',   // Icône sécurité/bouclier (violet-500)
    chart: '#3b82f6',      // Icône graphique/diagramme (blue-500)
    growth: '#10b981',     // Icône croissance/flèche verte (emerald-500)
  },
  
  // 🟩 4. Badges de statut
  badges: {
    compliant: {
      background: '#d1fae5', // Fond du badge (emerald-100)
      text: '#065f46',       // Texte du badge (emerald-900)
    },
  },
  
  // 🟣 5. Boutons/éléments interactifs
  buttons: {
    active: {
      background: '#6366f1', // Bouton actif (indigo-500)
      text: '#ffffff',       // Texte bouton actif (white)
    },
  },
  
  // Mapping TailwindCSS pour utilisation directe
  tailwind: {
    background: {
      primary: 'bg-slate-900',
      secondary: 'bg-slate-800',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-400',
      positive: 'text-emerald-500',
      negative: 'text-red-500',
    },
    icons: {
      security: 'text-violet-500',
      chart: 'text-blue-500',
      growth: 'text-emerald-500',
    },
    badges: {
      compliant: 'bg-emerald-100 text-emerald-900',
    },
    buttons: {
      active: 'bg-indigo-500 text-white',
    },
  },
};

// Configuration MUI Theme pour intégration avec Material-UI
export const muiThemeConfig = {
  palette: {
    mode: 'dark' as const,
    background: {
      default: FINTECH_THEME.background.primary,
      paper: FINTECH_THEME.background.secondary,
    },
    primary: {
      main: FINTECH_THEME.buttons.active.background,
    },
    secondary: {
      main: FINTECH_THEME.icons.chart,
    },
    success: {
      main: FINTECH_THEME.text.positive,
    },
    error: {
      main: FINTECH_THEME.text.negative,
    },
    text: {
      primary: FINTECH_THEME.text.primary,
      secondary: FINTECH_THEME.text.secondary,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: FINTECH_THEME.background.secondary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: FINTECH_THEME.background.secondary,
        },
      },
    },
  },
};

// Helper pour appliquer les couleurs dans les composants
export const useThemeColors = () => {
  return FINTECH_THEME;
};

// Classes CSS prédéfinies pour utilisation rapide
export const themeClasses = {
  card: `${FINTECH_THEME.tailwind.background.secondary} rounded-lg p-4`,
  title: `${FINTECH_THEME.tailwind.text.primary} text-xl font-semibold`,
  subtitle: `${FINTECH_THEME.tailwind.text.secondary} text-sm`,
  positiveIndicator: FINTECH_THEME.tailwind.text.positive,
  negativeIndicator: FINTECH_THEME.tailwind.text.negative,
  compliantBadge: FINTECH_THEME.tailwind.badges.compliant,
  activeButton: `${FINTECH_THEME.tailwind.buttons.active} px-4 py-2 rounded-md`,
};

// Export par défaut
export default FINTECH_THEME;