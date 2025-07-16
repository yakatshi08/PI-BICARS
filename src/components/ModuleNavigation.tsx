import React from 'react';
import { 
  LayoutDashboard, Building2, Shield, Bot, BarChart3, 
  AlertTriangle, FileText, Settings, Upload,
  TrendingUp, Calculator, Brain, Home, Droplets // ✅ AJOUT ICÔNE
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

export const ModuleNavigation: React.FC = () => {
  const { 
    darkMode, 
    activeModule, 
    setActiveModule, 
    selectedSector,
    importedFileData,
    onboardingCompleted
  } = useStore();
  const { t } = useTranslation();

  const navigationItems = [
    {
      id: 'home',
      label: t('nav.home', 'Accueil'),
      icon: Home,
      badge: !onboardingCompleted || !importedFileData ? 'NEW' : null,
      badgeColor: 'bg-green-500'
    },
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard
    },
    {
      id: 'import',
      label: t('nav.import'),
      icon: Upload
    },
    {
      id: 'banking-core',
      label: t('nav.bankingCore'),
      icon: Building2,
      sector: 'banking'
    },
    {
      id: 'credit-risk',
      label: t('nav.creditRisk'),
      icon: AlertTriangle,
      sector: 'banking'
    },
    {
      id: 'liquidity-alm',
      label: t('nav.liquidityALM', 'Liquidity & ALM'),
      icon: Droplets,
      sector: 'banking',
      badge: 'NEW',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'market-risk',
      label: t('nav.marketRisk', 'Market Risk'), // ✅ AJOUT
      icon: TrendingUp,                          // ✅ AJOUT
      sector: 'banking',                         // ✅ AJOUT
      badge: 'NEW',                              // ✅ AJOUT
      badgeColor: 'bg-red-500'                   // ✅ AJOUT
    },
    {
      id: 'insurance-core',
      label: t('nav.insuranceCore'),
      icon: Shield,
      sector: 'insurance'
    },
    {
      id: 'actuarial',
      label: t('nav.actuarialAnalytics', 'Actuarial Analytics'),
      icon: Calculator,
      sector: 'insurance'
    },
    {
      id: 'claims-underwriting',
      label: t('nav.claimsUnderwriting', 'Claims & Underwriting'),
      icon: FileText,
      sector: 'insurance',
      badge: 'NEW',
      badgeColor: 'bg-red-500'
    },
    {
      id: 'co-pilot',
      label: t('nav.coPilot'),
      icon: Bot
    },
    {
      id: 'analytics-ml',
      label: t('nav.analyticsML'),
      icon: Brain
    },
    {
      id: 'risk',
      label: t('nav.risk'),
      icon: AlertTriangle
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: FileText
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings
    }
  ];

  const filteredItems = navigationItems.filter(item => {
    if (selectedSector === 'all') return true;
    if (!item.sector) return true;
    return item.sector === selectedSector;
  });

  return (
    <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 overflow-x-auto py-3"> {/* ✅ flex-wrap pour éviter scroll */}
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative
                ${activeModule === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full 
                  ${item.badgeColor || 'bg-indigo-500'} text-white`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

