import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, AlertTriangle, Shield, 
  BarChart3, Activity, FileText, Download,
  ChevronRight, Info, AlertCircle
} from 'lucide-react';
import { useStore } from '../store';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, Scatter, ScatterChart, ZAxis
} from 'recharts';

const CreditRisk = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState('pd');

  // Métriques principales IFRS 9/17
  const creditMetrics = [
    {
      id: 'pd',
      name: 'PD',
      fullName: 'Probability of Default',
      value: '2.8%',
      trend: -0.2,
      status: 'improving',
      benchmark: '3.1%'
    },
    {
      id: 'lgd',
      name: 'LGD',
      fullName: 'Loss Given Default',
      value: '35.2%',
      trend: -1.5,
      status: 'stable',
      benchmark: '38.0%'
    },
    {
      id: 'ead',
      name: 'EAD',
      fullName: 'Exposure at Default',
      value: '€458M',
      trend: +5.2,
      status: 'monitoring',
      benchmark: '€420M'
    },
    {
      id: 'el',
      name: 'EL',
      fullName: 'Expected Loss',
      value: '€45.2M',
      trend: -3.1,
      status: 'improving',
      benchmark: '€48.5M'
    }
  ];

  // Répartition par stade IFRS 9
  const ifrs9Stages = [
    { stage: 'Stage 1', amount: 82, percentage: 82, color: '#10B981' },
    { stage: 'Stage 2', amount: 15, percentage: 15, color: '#F59E0B' },
    { stage: 'Stage 3', amount: 3, percentage: 3, color: '#EF4444' }
  ];

  // Portfolio par secteur
  const sectorExposure = [
    { sector: 'Immobilier', exposure: 180, pd: 2.1, lgd: 30 },
    { sector: 'Industrie', exposure: 120, pd: 3.2, lgd: 40 },
    { sector: 'Services', exposure: 95, pd: 2.5, lgd: 35 },
    { sector: 'Commerce', exposure: 85, pd: 3.8, lgd: 45 },
    { sector: 'Énergie', exposure: 65, pd: 2.9, lgd: 38 },
    { sector: 'Tech', exposure: 55, pd: 4.2, lgd: 50 }
  ];

  // Matrice de rating
  const ratingMatrix = [
    { rating: 'AAA-AA', count: 45, percentage: 15, avgPD: 0.05 },
    { rating: 'A', count: 120, percentage: 25, avgPD: 0.15 },
    { rating: 'BBB', count: 180, percentage: 35, avgPD: 0.85 },
    { rating: 'BB', count: 85, percentage: 15, avgPD: 2.5 },
    { rating: 'B', count: 45, percentage: 8, avgPD: 5.2 },
    { rating: 'CCC-D', count: 10, percentage: 2, avgPD: 25.0 }
  ];

  // Évolution des provisions
  const provisionEvolution = [
    { month: 'Jan', ecl: 42.5, actual: 41.8 },
    { month: 'Fév', ecl: 43.2, actual: 42.9 },
    { month: 'Mar', ecl: 44.1, actual: 43.5 },
    { month: 'Avr', ecl: 44.8, actual: 44.2 },
    { month: 'Mai', ecl: 45.2, actual: 44.9 },
    { month: 'Jun', ecl: 45.2, actual: 45.0 }
  ];

  // Stress test scenarios
  const stressScenarios = [
    { scenario: 'Base', impact: 0, pdChange: 0, lgdChange: 0 },
    { scenario: 'Adverse', impact: 15.2, pdChange: +1.2, lgdChange: +5.5 },
    { scenario: 'Severe', impact: 32.5, pdChange: +2.8, lgdChange: +12.3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'improving': return 'text-green-500';
      case 'stable': return 'text-blue-500';
      case 'monitoring': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/banking-core')}
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
                Credit Risk Management
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestion du risque de crédit IFRS 9/17
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export IFRS 9
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {creditMetrics.map((metric) => (
            <div
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                selectedMetric === metric.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {metric.name}
                </h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {metric.fullName}
              </p>
              <p className="text-2xl font-bold mb-2">{metric.value}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${metric.trend < 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.trend > 0 ? '+' : ''}{metric.trend}%
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  metric.status === 'improving' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : metric.status === 'stable'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {metric.status}
                </span>
              </div>
              <div className="mt-2 text-xs">
                <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                  Benchmark: {metric.benchmark}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Répartition IFRS 9 et Portfolio sectoriel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stages IFRS 9 */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Répartition IFRS 9 Stages
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ifrs9Stages}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {ifrs9Stages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {ifrs9Stages.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {stage.stage}
                      </span>
                    </div>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stage.percentage}%
                    </span>
                  </div>
                ))}
                <div className={`pt-3 mt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Migration Stage 1→2: -2.1%
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Migration Stage 2→3: -0.8%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exposure sectorielle */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Exposition par Secteur (€M)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorExposure}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="sector" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="exposure" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Matrice de rating et évolution ECL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Matrice de rating */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribution des Ratings
            </h3>
            <div className="space-y-3">
              {ratingMatrix.map((rating, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {rating.rating}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        PD: {rating.avgPD}%
                      </span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rating.count} ({rating.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${rating.percentage}%`,
                        backgroundColor: index < 3 ? '#10B981' : index < 5 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évolution ECL */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution ECL vs Provisions (€M)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={provisionEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ecl" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="ECL Modèle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Provisions réelles"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stress Testing */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Stress Testing BCE
            </h3>
            <button
              onClick={() => navigate('/stress-test')}
              className="text-indigo-500 hover:text-indigo-600 flex items-center text-sm"
            >
              Voir détails
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stressScenarios.map((scenario, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  scenario.scenario === 'Base'
                    ? darkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                    : scenario.scenario === 'Adverse'
                    ? darkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                    : darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
                }`}
              >
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Scénario {scenario.scenario}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Impact ECL
                    </span>
                    <span className={`font-semibold ${
                      scenario.impact === 0 ? '' : 'text-red-500'
                    }`}>
                      {scenario.impact > 0 ? '+' : ''}{scenario.impact}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Δ PD
                    </span>
                    <span>{scenario.pdChange > 0 ? '+' : ''}{scenario.pdChange}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Δ LGD
                    </span>
                    <span>{scenario.lgdChange > 0 ? '+' : ''}{scenario.lgdChange}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions et outils */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <button className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all`}>
            <Activity className="h-6 w-6 text-purple-500 mb-2" />
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Validation Modèle
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Backtesting & benchmarking
            </p>
          </button>

          <button className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all`}>
            <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Early Warning
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Détection précoce défauts
            </p>
          </button>

          <button className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all`}>
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Reporting IFRS
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Templates automatisés
            </p>
          </button>

          <button className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all`}>
            <Shield className="h-6 w-6 text-green-500 mb-2" />
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Mitigation
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Stratégies de couverture
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditRisk;