import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfileData {
  id: string;
  title: string;
  icon: any;
  description: string;
  color: string;
  templates: string[];
}

interface StoreState {
  // Mode sombre
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Langue
  language: 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt';
  setLanguage: (language: 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt') => void;
  
  // Profil utilisateur (existant - gardé pour compatibilité)
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
  
  // Profil utilisateur complet (nouveau pour page d'accueil)
  userProfile: UserProfileData | null;
  setUserProfile: (profile: UserProfileData | null) => void;
  
  // Secteur sélectionné (étendu avec 'mixed' et 'unknown')
  selectedSector: 'all' | 'banking' | 'insurance' | 'mixed' | 'unknown';
  setSelectedSector: (sector: 'all' | 'banking' | 'insurance' | 'mixed' | 'unknown') => void;
  
  // Module actif
  activeModule: string;
  setActiveModule: (module: string) => void;
  
  // Données Dashboard existantes (préservées)
  kpis: any[];
  charts: any[];
  
  // Filtres et préférences
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  
  // Notifications
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  
  // État de chargement
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // ===== NOUVELLES PROPRIÉTÉS POUR PAGE D'ACCUEIL =====
  
  // Données du fichier importé
  importedFileData: {
    name: string;
    size: number;
    type: string;
    data: any[];
    uploadDate: Date;
  } | null;
  setImportedFileData: (data: any) => void;
  
  // Résultats d'analyse IA
  analysisResult: {
    schema?: any;
    sectorDetection?: any;
    suggestedKPIs?: string[];
    dataQuality?: any;
    timestamp: Date;
  } | null;
  setAnalysisResult: (result: any) => void;
  
  // Configuration du dashboard générée
  dashboardConfig: {
    layout: any;
    widgets: any[];
    theme: any;
  } | null;
  setDashboardConfig: (config: any) => void;
  
  // État de l'onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  
  // Contexte Co-pilot IA
  copilotContext: {
    lastQuery?: string;
    suggestions?: any[];
    history?: any[];
  };
  updateCopilotContext: (context: any) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Valeurs par défaut existantes
      darkMode: false,
      language: 'fr',
      selectedProfile: 'banker',
      selectedSector: 'all',
      activeModule: 'dashboard',
      kpis: [],
      charts: [],
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        end: new Date()
      },
      notifications: [],
      isLoading: false,
      
      // Nouvelles valeurs par défaut
      userProfile: null,
      importedFileData: null,
      analysisResult: null,
      dashboardConfig: null,
      onboardingCompleted: false,
      copilotContext: {},
      
      // Actions existantes
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      setLanguage: (language) => set({ language }),
      
      setSelectedProfile: (profile) => set({ 
        selectedProfile: profile,
        // Mise à jour automatique du selectedProfile quand userProfile change
        userProfile: profile ? { ...set.userProfile, id: profile } : set.userProfile
      }),
      
      setSelectedSector: (sector) => set({ selectedSector: sector }),
      
      setActiveModule: (module) => set({ activeModule: module }),
      
      setDateRange: (range) => set({ dateRange: range }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { 
          id: Date.now().toString(), 
          timestamp: new Date(),
          ...notification 
        }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // ===== NOUVELLES ACTIONS =====
      
      setUserProfile: (profile) => set((state) => ({ 
        userProfile: profile,
        // Synchronisation avec selectedProfile pour compatibilité
        selectedProfile: profile?.id || state.selectedProfile
      })),
      
      setImportedFileData: (data) => set({ 
        importedFileData: data ? {
          ...data,
          uploadDate: new Date()
        } : null
      }),
      
      setAnalysisResult: (result) => set({ 
        analysisResult: result ? {
          ...result,
          timestamp: new Date()
        } : null
      }),
      
      setDashboardConfig: (config) => set({ dashboardConfig: config }),
      
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      
      updateCopilotContext: (context) => set((state) => ({
        copilotContext: {
          ...state.copilotContext,
          ...context
        }
      }))
    }),
    {
      name: 'pi-bicars-storage', // Nom du localStorage existant conservé
      partialize: (state) => ({
        // Propriétés existantes à persister
        darkMode: state.darkMode,
        language: state.language,
        selectedProfile: state.selectedProfile,
        selectedSector: state.selectedSector,
        dateRange: state.dateRange,
        // Nouvelles propriétés à persister
        userProfile: state.userProfile,
        onboardingCompleted: state.onboardingCompleted,
        // On ne persiste pas les données de fichier et analyses pour éviter de surcharger le localStorage
      })
    }
  )
);

// Export des types pour utilisation dans les composants
export type { StoreState, UserProfileData };