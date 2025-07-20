import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, FileText, TrendingUp, AlertCircle,
  Download, Filter, Info, BarChart3, Activity
} from 'lucide-react';
import { useStore } from '../store';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell
} from 'recharts';

const BaleRatios = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('overview');

  // Données des ratios principaux
  const mainRatios = [
    {
      name: 'CET1',
      fullName: 'Common Equity Tier 1',
      value: 14.2,
      minimum: 4.5,
      buffer: 2.5,
      total: 7.0,
      status: 'healthy',
      trend: '+0.3%'
    },
    {
      name: 'Tier 1',
      fullName: 'Tier 1 Capital Ratio',
      value: 15.8,
      minimum: 6.0,
      buffer: 2.5,
      total: 8.5,
      status: 'healthy',
      trend: '+0.4%'
    },
    {
      name: 'Total Capital',
      fullName: 'Total Capital Ratio',
      value: 18.2,
      minimum: 8.0,
      buffer: 2.5,
      total: 10.5,
      status: 'healthy',
      trend: '+0.5%'
    },
    {
      name: 'Leverage Ratio',
      fullName: 'Leverage Ratio',
      value: 5.2,
      minimum: 3.0,
      buffer: 0,
      total: 3.0,
      status: 'healthy',
      trend: '+0.1%'
    }
  ];

  // Données de liquidité
  const liquidityRatios = [
    { name: 'LCR', value: 142, minimum: 100, status: 'healthy' },
    { name: 'NSFR', value: 118, minimum: 100, status: 'healthy' }
  ];

  // Évolution trimestrielle
  const quarterlyEvolution = [
    { quarter: 'Q1 2024', CET1: 13.5, Tier1: 15.1, Total: 17.5, Leverage: 5.0 },
    { quarter: 'Q2 2024', CET1: 13.7, Tier1: 15.3, Total: 17.7, Leverage: 5.1 },
    { quarter: 'Q3 2024', CET1: 13.9, Tier1: 15.5, Total: 17.9, Leverage: 5.1 },
    { quarter: 'Q4 2024', CET1: 14.0, Tier1: 15.6, Total: 18.0, Leverage: 5.2 },
    { quarter: 'Q1 2025', CET1: 14.2, Tier1: 15.8, Total: 18.2, Leverage: 5.2 }
  ];

  // Buffers détaillés
  const bufferDetails = [
    { type: 'Conservation', value: 2.5, applicable: true },
    { type: 'Contracyclique', value: 0.5, applicable: true },
    { type: 'Systémique', value: 1.0, applicable: false },
    { type: 'Risque systémique', value: 0.0, applicable: false }
  ];

  // RWA breakdown
  const rwaBreakdown = [
    { category: 'Risque de crédit', amount: 450, percentage: 72 },
    { category: 'Risque de marché', amount: 75, percentage: 12 },
    { category: 'Risque opérationnel', amount: 100, percentage: 16 }
  ];

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
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
                Ratios Bâle III
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tableau de bord des ratios prudentiels réglementaires
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-opacity-80 transition-colors flex items-center`}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Rapport Bâle III
            </button>
          </div>
        </div>

        {/* Vue d'ensemble des ratios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mainRatios.map((ratio, index) => (
            <div
              key={index}
              onClick={() => navigate(`/ratios/${ratio.name.toLowerCase()}`)}
              className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ratio.name}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {ratio.fullName}
                  </p>
                </div>
                <Shield className={`h-8 w-8 ${getStatusColor(ratio.status)}`} />
              </div>
              
              <div className="mb-4">
                <p className="text-3xl font-bold">{ratio.value}%</p>
                <p className={`text-sm ${parseFloat(ratio.trend) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {ratio.trend} vs trimestre précédent
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Minimum</span>
                  <span>{ratio.minimum}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Buffer</span>
                  <span>{ratio.buffer}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full relative"
                    style={{ width: '100%' }}
                  >
                    <div 
                      className="absolute w-1 h-4 bg-gray-900 dark:bg-white -top-1"
                      style={{ left: `${(ratio.value / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ratios de liquidité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ratios de Liquidité
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {liquidityRatios.map((ratio, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/ratios/${ratio.name.toLowerCase()}`)}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer hover:shadow-md transition-all`}
                >
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ratio.name}
                  </h4>
                  <p className="text-2xl font-bold text-blue-500">{ratio.value}%</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Min: {ratio.minimum}%
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((ratio.value / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buffers détaillés */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Coussins de Capital
            </h3>
            <div className="space-y-3">
              {bufferDetails.map((buffer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      buffer.applicable ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {buffer.type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`font-semibold ${
                      buffer.applicable ? darkMode ? 'text-white' : 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {buffer.value}%
                    </span>
                    {!buffer.applicable && (
                      <span className={`ml-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        N/A
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className={`pt-3 mt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Total applicable
                  </span>
                  <span className="font-bold text-indigo-500">3.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Évolution temporelle et RWA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution trimestrielle */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution Trimestrielle
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="CET1" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Tier1" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Total" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Leverage" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RWA Breakdown */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Répartition des RWA (€625B)
            </h3>
            <div className="space-y-4">
              {rwaBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {item.category}
                    </span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      €{item.amount}B ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: colors[index]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions et stress testing */}
        <div className={`mt-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actions Réglementaires
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
              Conforme
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/stress-test')}
              className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all text-left`}
            >
              <Activity className="h-6 w-6 text-indigo-500 mb-2" />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Stress Test BCE
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Simuler scénarios adverses
              </p>
            </button>
            
            <button
              onClick={() => navigate('/corep-report')}
              className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all text-left`}
            >
              <FileText className="h-6 w-6 text-green-500 mb-2" />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Rapport COREP
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Générer reporting réglementaire
              </p>
            </button>
            
            <button className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all text-left`}>
              <BarChart3 className="h-6 w-6 text-purple-500 mb-2" />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Optimisation RWA
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Analyser opportunités
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaleRatios;