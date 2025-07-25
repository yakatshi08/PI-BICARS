import React, { useState } from 'react';
import {
  Shield, TrendingUp, AlertTriangle, Activity,
  Calculator, ChevronRight, ArrowLeft, Info,
  BarChart3, PieChart, Target, AlertCircle,
  CheckCircle, Download, FileText, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface RiskModule {
  name: string;
  value: number;
  percentage: number;
  subRisks?: { name: string; value: number }[];
}

export const InsuranceSCRDetail: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Q4 2024');

  // Données SCR détaillées
  const scrData = {
    totalSCR: 450,
    eligibleFunds: 832,
    ratio: 185,
    threshold: 100,
    mcrValue: 198,
    mcrRatio: 420,
    mcrThreshold: 100
  };

  // Décomposition par module de risque
  const riskModules: RiskModule[] = [
    {
      name: 'Risque de Marché',
      value: 180,
      percentage: 40,
      subRisks: [
        { name: 'Risque de taux', value: 65 },
        { name: 'Risque actions', value: 50 },
        { name: 'Risque immobilier', value: 35 },
        { name: 'Risque de spread', value: 30 }
      ]
    },
    {
      name: 'Risque de Souscription',
      value: 135,
      percentage: 30,
      subRisks: [
        { name: 'Non-vie', value: 75 },
        { name: 'Vie', value: 40 },
        { name: 'Santé', value: 20 }
      ]
    },
    {
      name: 'Risque de Crédit',
      value: 90,
      percentage: 20,
      subRisks: [
        { name: 'Défaut', value: 60 },
        { name: 'Concentration', value: 30 }
      ]
    },
    {
      name: 'Risque Opérationnel',
      value: 45,
      percentage: 10,
      subRisks: [
        { name: 'Processus', value: 25 },
        { name: 'Systèmes', value: 20 }
      ]
    }
  ];

  // Évolution historique SCR/MCR
  const historicalData = [
    { month: 'Juil', scr: 182, mcr: 415, scrValue: 445, mcrValue: 195 },
    { month: 'Août', scr: 180, mcr: 410, scrValue: 448, mcrValue: 196 },
    { month: 'Sept', scr: 178, mcr: 405, scrValue: 452, mcrValue: 197 },
    { month: 'Oct', scr: 183, mcr: 412, scrValue: 448, mcrValue: 196 },
    { month: 'Nov', scr: 184, mcr: 418, scrValue: 446, mcrValue: 197 },
    { month: 'Déc', scr: 185, mcr: 420, scrValue: 450, mcrValue: 198 }
  ];

  // Structure des fonds propres
  const fundsStructure = [
    { name: 'Tier 1', value: 750, percentage: 90, color: '#10b981' },
    { name: 'Tier 2', value: 65, percentage: 8, color: '#3b82f6' },
    { name: 'Tier 3', value: 17, percentage: 2, color: '#f59e0b' }
  ];

  // Stress tests
  const stressTests = [
    { scenario: 'Choc actions -40%', impact: -12, newRatio: 173 },
    { scenario: 'Hausse taux +200bp', impact: -8, newRatio: 177 },
    { scenario: 'Catastrophe naturelle', impact: -15, newRatio: 170 },
    { scenario: 'Défaut majeur', impact: -10, newRatio: 175 },
    { scenario: 'Scénario combiné', impact: -25, newRatio: 160 }
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/insurance/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyse SCR/MCR Détaillée
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Solvency Capital Requirement & Minimum Capital Requirement
              </p>
            </div>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <option>Q4 2024</option>
            <option>Q3 2024</option>
            <option>Q2 2024</option>
          </select>
        </div>

        {/* Cartes KPI principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* SCR Coverage */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-purple-500" />
              <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                <TrendingUp className="h-4 w-4" />
                +2pp
              </span>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                SCR Coverage Ratio
              </p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {scrData.ratio}%
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Seuil: {scrData.threshold}%
                </span>
              </div>
            </div>
          </div>

          {/* MCR Coverage */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-blue-500" />
              <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                <TrendingUp className="h-4 w-4" />
                +5pp
              </span>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                MCR Coverage Ratio
              </p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {scrData.mcrRatio}%
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Seuil: {scrData.mcrThreshold}%
                </span>
              </div>
            </div>
          </div>

          {/* SCR Montant */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Calculator className="h-8 w-8 text-green-500" />
              <Info className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                SCR Requis
              </p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {scrData.totalSCR}M€
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Fonds éligibles: {scrData.eligibleFunds}M€
              </p>
            </div>
          </div>

          {/* MCR Montant */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <Info className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                MCR Requis
              </p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {scrData.mcrValue}M€
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                25% du SCR
              </p>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Décomposition SCR par risque */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Décomposition du SCR par Module de Risque
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={riskModules}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskModules.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Évolution historique */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution SCR/MCR Ratios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scr" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="SCR Ratio %"
                />
                <Line 
                  type="monotone" 
                  dataKey="mcr" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="MCR Ratio %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Détail des modules de risque */}
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Détail des Modules de Risque
          </h3>
          <div className="space-y-4">
            {riskModules.map((module, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {module.name}
                  </h4>
                  <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {module.value}M€ ({module.percentage}%)
                  </span>
                </div>
                <div className="space-y-2">
                  {module.subRisks?.map((subRisk, subIndex) => (
                    <div key={subIndex} className="flex justify-between items-center pl-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {subRisk.name}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {subRisk.value}M€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structure des fonds propres et Stress Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Structure des fonds propres */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Structure des Fonds Propres Éligibles
            </h3>
            <div className="space-y-4">
              {fundsStructure.map((tier, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tier.name}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tier.value}M€ ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${tier.percentage}%`,
                        backgroundColor: tier.color
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className={`mt-4 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <p className={`text-sm ${
                  darkMode ? 'text-green-400' : 'text-green-700'
                }`}>
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  90% Tier 1 : Excellente qualité des fonds propres
                </p>
              </div>
            </div>
          </div>

          {/* Stress Tests */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Stress Tests - Impact sur le SCR Ratio
            </h3>
            <div className="space-y-3">
              {stressTests.map((test, index) => (
                <div key={index} className={`border rounded-lg p-3 ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {test.scenario}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        test.impact < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {test.impact}pp
                      </span>
                      <span className={`text-sm font-semibold ${
                        test.newRatio >= 150 ? 'text-green-500' : 
                        test.newRatio >= 100 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        → {test.newRatio}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className={`mt-4 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <p className={`text-sm ${
                  darkMode ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Tous les scénarios maintiennent le ratio au-dessus du seuil de 100%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="h-5 w-5" />
            Exporter Rapport SCR
          </button>
          <button className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}>
            <Calculator className="h-5 w-5" />
            Simulateur de Scénarios
          </button>
        </div>
      </div>
    </div>
  );
};