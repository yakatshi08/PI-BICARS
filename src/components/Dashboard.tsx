import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Shield, CreditCard, Droplets, TrendingUp, Brain,
  BarChart3, FileText, AlertCircle, ChevronRight
} from 'lucide-react';
import { useStore } from '../store'; // ← CORRIGÉ : ../store au lieu de ./store

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, selectedSector } = useStore();

  const modules = [
    {
      id: 'copilot',
      title: 'Co-Pilot IA',
      description: 'Votre assistant intelligent Finance & Assurance',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500',
      metric: { label: 'Commandes', value: '∞' },
      path: '/copilot'
    },
    {
      id: 'credit-risk',
      title: 'Credit Risk Management',
      description: 'Analyse PD, LGD, EAD et calcul des provisions ECL',
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
      metric: { label: 'NPL Ratio', value: '3.2%' },
      path: '/banking/credit-risk'
    },
    {
      id: 'insurance',
      title: 'Insurance Core Module',
      description: 'Solvency II, métriques techniques et gestion des risques',
      icon: Shield,
      color: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500',
      metric: { label: 'SCR Coverage', value: '185%' },
      path: '/insurance'
    },
    {
      id: 'banking',
      title: 'Banking Core',
      description: 'Métriques prudentielles et ratios bancaires',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-500',
      metric: { label: 'CET1 Ratio', value: '14.8%' },
      path: '/banking'
    },
    {
      id: 'liquidity',
      title: 'Liquidity & ALM',
      description: 'Gestion de la liquidité et ALM analytics',
      icon: Droplets,
      color: 'from-cyan-500 to-teal-500',
      iconBg: 'bg-cyan-500',
      metric: { label: 'LCR', value: '125.5%' },
      path: '/banking/liquidity-alm'
    },
    {
      id: 'market-risk',
      title: 'Market Risk',
      description: 'VaR, CVaR et stress tests marché',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500',
      metric: { label: 'VaR 99%', value: '€2.3M' },
      path: '/banking/market-risk'
    }
  ];

  // Filtrer les modules selon le secteur sélectionné
  const filteredModules = modules.filter(module => {
    if (selectedSector === 'all') return true;
    if (selectedSector === 'banking') {
      return ['banking', 'credit-risk', 'liquidity', 'market-risk', 'copilot'].includes(module.id);
    }
    if (selectedSector === 'insurance') {
      return ['insurance', 'copilot'].includes(module.id);
    }
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Container principal sans menu latéral */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Modules Sectoriels
          </h1>
          <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Accédez aux modules spécialisés pour la finance et l'assurance
          </p>
        </div>

        {/* Grille des modules - responsive et pleine largeur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              onClick={() => navigate(module.path)}
              className={`
                relative overflow-hidden rounded-2xl cursor-pointer
                transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}
              `}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10`} />
              
              {/* Content */}
              <div className="relative p-6">
                {/* Header avec icône et métrique */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${module.iconBg} bg-opacity-20`}>
                    <module.icon className={`h-6 w-6 text-white`} />
                  </div>
                  {module.metric && (
                    <div className="text-right">
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {module.metric.label}
                      </p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {module.metric.value}
                      </p>
                    </div>
                  )}
                </div>

                {/* Titre et description */}
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {module.title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {module.description}
                </p>

                {/* Call to action */}
                <div className="flex items-center text-sm font-medium">
                  <span className={`bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                    Accéder au module
                  </span>
                  <ChevronRight className={`ml-1 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section additionnelle - Quick Actions */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/data-import')}
              className={`
                p-4 rounded-xl text-left transition-all
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 shadow'
                }
              `}
            >
              <FileText className="h-5 w-5 mb-2 text-indigo-600" />
              <h3 className="font-semibold">Importer des données</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Excel, CSV, JSON
              </p>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className={`
                p-4 rounded-xl text-left transition-all
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 shadow'
                }
              `}
            >
              <BarChart3 className="h-5 w-5 mb-2 text-green-600" />
              <h3 className="font-semibold">Générer un rapport</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                PDF, Excel
              </p>
            </button>

            {/* MODIFICATION : Changement de '/analyses' vers '/modules-sectoriels' */}
            <button
              onClick={() => navigate('/modules-sectoriels')}
              className={`
                p-4 rounded-xl text-left transition-all
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 shadow'
                }
              `}
            >
              <Brain className="h-5 w-5 mb-2 text-purple-600" />
              <h3 className="font-semibold">Analyses avancées</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ML & Prédictions
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};