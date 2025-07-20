import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { 
  ArrowLeft, TrendingDown, AlertTriangle, DollarSign, 
  BarChart3, Activity, Shield, Calculator,
  FileText, TrendingUp
} from 'lucide-react';

export const CreditRisk: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header du module */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-slate-900' : 'bg-white'} px-6 pt-6 pb-4 shadow-sm`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/banking')}  // Modification appliquée ici
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-900'
            } shadow-sm`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Credit Risk Management
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyse PD, LGD, EAD et calcul des provisions ECL
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-4">
        {/* KPIs Credit Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* KPI 1: Exposition totale */}
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Exposition totale
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  €125.4M
                </p>
                <p className="text-sm text-green-500 mt-1">+2.3% vs mois dernier</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>

          {/* KPI 2: NPL Ratio */}
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  NPL Ratio
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  3.2%
                </p>
                <p className="text-sm text-red-500 mt-1">+0.3% vs trimestre</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </div>

          {/* KPI 3: PD Moyen */}
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  PD Moyen
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  1.8%
                </p>
                <p className="text-sm text-green-500 mt-1">-0.1% amélioration</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </div>

          {/* KPI 4: Coverage Ratio */}
          <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Coverage Ratio
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  65.4%
                </p>
                <p className="text-sm text-green-500 mt-1">Conforme</p>
              </div>
              <Shield className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Analyse des Stages */}
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Répartition par Stages IFRS 9
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage 1 - Performant</span>
                <span className="text-green-500 font-semibold">78.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage 2 - Sous surveillance</span>
                <span className="text-yellow-500 font-semibold">18.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage 3 - Non performant</span>
                <span className="text-red-500 font-semibold">3.2%</span>
              </div>
            </div>
          </div>

          {/* Section Actions rapides */}
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Calculer ECL
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Stress Test
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Rapport IFRS 9
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Matrices Rating
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder pour graphiques */}
        <div className={`mt-6 rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Évolution des métriques Credit Risk
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {/* Ici viendra le graphique depuis votre code original */}
            <BarChart3 className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditRisk;