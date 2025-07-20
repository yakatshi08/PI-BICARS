import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, TrendingUp, AlertCircle, Info,
  Download, Calendar, Filter, ChevronDown
} from 'lucide-react';
import { useStore } from '../../store';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CET1Page = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [showDetails, setShowDetails] = useState(false);

  // Données historiques CET1
  const historicalData = [
    { month: 'Jan', cet1: 13.8, minimum: 4.5, buffer: 2.5, target: 14.0 },
    { month: 'Fév', cet1: 13.9, minimum: 4.5, buffer: 2.5, target: 14.0 },
    { month: 'Mar', cet1: 14.0, minimum: 4.5, buffer: 2.5, target: 14.0 },
    { month: 'Avr', cet1: 14.1, minimum: 4.5, buffer: 2.5, target: 14.0 },
    { month: 'Mai', cet1: 14.2, minimum: 4.5, buffer: 2.5, target: 14.0 },
    { month: 'Jun', cet1: 14.2, minimum: 4.5, buffer: 2.5, target: 14.0 }
  ];

  // Décomposition du CET1
  const cet1Components = [
    { name: 'Capital social', value: 5.2, percentage: 36.6 },
    { name: 'Réserves', value: 4.8, percentage: 33.8 },
    { name: 'Résultats non distribués', value: 3.1, percentage: 21.8 },
    { name: 'Autres éléments', value: 1.1, percentage: 7.8 }
  ];

  // Facteurs d'impact
  const impactFactors = [
    { factor: 'Croissance des prêts', impact: -0.3, type: 'negative' },
    { factor: 'Bénéfices retenus', impact: +0.5, type: 'positive' },
    { factor: 'Dividendes versés', impact: -0.2, type: 'negative' },
    { factor: 'Optimisation RWA', impact: +0.2, type: 'positive' },
    { factor: 'Provisions', impact: -0.1, type: 'negative' }
  ];

  // Comparaison avec peers
  const peerComparison = [
    { name: 'Notre banque', value: 14.2 },
    { name: 'Moyenne secteur', value: 13.5 },
    { name: 'Top quartile', value: 15.2 },
    { name: 'Minimum réglementaire', value: 7.0 }
  ];

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                CET1 Ratio - Common Equity Tier 1
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Analyse détaillée du ratio de fonds propres de base
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                CET1 Actuel
              </span>
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500">14.2%</p>
            <p className="text-sm text-green-500 mt-1">+0.3% vs mois dernier</p>
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Minimum réglementaire
              </span>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">7.0%</p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Exigence Bâle III
            </p>
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Buffer disponible
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">7.2%</p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Au-dessus du minimum
            </p>
          </div>

          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Objectif interne
              </span>
              <Info className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">14.0%</p>
            <p className="text-sm text-green-500 mt-1">Objectif atteint ✓</p>
          </div>
        </div>

        {/* Période de sélection */}
        <div className="flex justify-end mb-6">
          <div className="flex space-x-2">
            {['1M', '3M', '6M', '1Y', 'YTD'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution historique */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution du CET1 Ratio
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis domain={[0, 16]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minimum" 
                    stackId="1" 
                    stroke="#EF4444" 
                    fill="#FEE2E2" 
                    name="Minimum"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="buffer" 
                    stackId="1" 
                    stroke="#F59E0B" 
                    fill="#FEF3C7" 
                    name="Buffer"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cet1" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="CET1 Actuel"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    name="Objectif"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Décomposition du CET1 */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Composition du CET1
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cet1Components}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cet1Components.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Facteurs d'impact et comparaison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Facteurs d'impact */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Facteurs d'impact (YTD)
            </h3>
            <div className="space-y-3">
              {impactFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {factor.factor}
                  </span>
                  <span className={`font-semibold ${
                    factor.type === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact}%
                  </span>
                </div>
              ))}
              <div className={`pt-3 mt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Impact total
                  </span>
                  <span className="font-bold text-green-500">+0.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparaison avec peers */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparaison sectorielle
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peerComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis type="number" domain={[0, 16]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis dataKey="name" type="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6">
                    {peerComparison.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#8B5CF6' : index === 3 ? '#EF4444' : '#3B82F6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Actions et recommandations */}
        <div className={`mt-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recommandations stratégiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Court terme (3 mois)
              </h4>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Maintenir le ratio au-dessus de 14%</li>
                <li>• Optimiser les RWA de 5%</li>
                <li>• Limiter la distribution de dividendes</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Moyen terme (12 mois)
              </h4>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Viser un ratio de 14.5%</li>
                <li>• Développer les activités peu consommatrices</li>
                <li>• Préparer augmentation de capital si nécessaire</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Long terme (3 ans)
              </h4>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Atteindre le top quartile (15%+)</li>
                <li>• Digitalisation pour réduire les coûts</li>
                <li>• Diversification des sources de revenus</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CET1Page;