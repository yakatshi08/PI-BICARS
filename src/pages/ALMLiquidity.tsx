import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Droplets, Activity, 
  BarChart3, Shield, AlertCircle, Download,
  Calendar, Clock, DollarSign, Percent
} from 'lucide-react';
import { useStore } from '../store';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart
} from 'recharts';

const ALMLiquidity = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('liquidity');
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  // Métriques principales de liquidité
  const liquidityMetrics = [
    {
      name: 'LCR',
      fullName: 'Liquidity Coverage Ratio',
      value: 142,
      minimum: 100,
      trend: +5,
      status: 'healthy'
    },
    {
      name: 'NSFR',
      fullName: 'Net Stable Funding Ratio',
      value: 118,
      minimum: 100,
      trend: +2,
      status: 'healthy'
    },
    {
      name: 'Liquidity Buffer',
      fullName: 'Coussin de liquidité',
      value: '€8.2B',
      trend: +3.5,
      status: 'strong'
    },
    {
      name: 'Survival Period',
      fullName: 'Période de survie',
      value: '45 jours',
      trend: +3,
      status: 'adequate'
    }
  ];

  // Gap Analysis par maturité
  const gapAnalysis = [
    { maturity: 'O/N', assets: 15, liabilities: 12, gap: 3 },
    { maturity: '1W', assets: 25, liabilities: 28, gap: -3 },
    { maturity: '1M', assets: 45, liabilities: 40, gap: 5 },
    { maturity: '3M', assets: 85, liabilities: 75, gap: 10 },
    { maturity: '6M', assets: 120, liabilities: 110, gap: 10 },
    { maturity: '1Y', assets: 180, liabilities: 165, gap: 15 },
    { maturity: '3Y', assets: 250, liabilities: 235, gap: 15 },
    { maturity: '5Y+', assets: 320, liabilities: 310, gap: 10 }
  ];

  // Courbe de taux
  const yieldCurve = [
    { maturity: 'O/N', current: 3.85, previous: 3.75, change: 0.10 },
    { maturity: '1M', current: 3.92, previous: 3.85, change: 0.07 },
    { maturity: '3M', current: 4.05, previous: 3.98, change: 0.07 },
    { maturity: '6M', current: 4.15, previous: 4.10, change: 0.05 },
    { maturity: '1Y', current: 4.22, previous: 4.20, change: 0.02 },
    { maturity: '2Y', current: 4.10, previous: 4.15, change: -0.05 },
    { maturity: '5Y', current: 3.85, previous: 3.95, change: -0.10 },
    { maturity: '10Y', current: 3.75, previous: 3.88, change: -0.13 }
  ];

  // Stress test liquidité
  const liquidityStress = [
    { scenario: 'Normal', lcr: 142, nsfr: 118, buffer: 8.2 },
    { scenario: 'Modéré', lcr: 125, nsfr: 110, buffer: 6.5 },
    { scenario: 'Sévère', lcr: 105, nsfr: 95, buffer: 4.2 },
    { scenario: 'Extrême', lcr: 85, nsfr: 82, buffer: 2.1 }
  ];

  // Composition du buffer de liquidité
  const bufferComposition = [
    { type: 'Cash & Banques centrales', amount: 3.2, percentage: 39 },
    { type: 'Obligations souveraines', amount: 2.8, percentage: 34 },
    { type: 'Covered bonds', amount: 1.5, percentage: 18 },
    { type: 'Corporate bonds (AAA-AA)', amount: 0.7, percentage: 9 }
  ];

  // Concentration des financements
  const fundingConcentration = [
    { source: 'Dépôts retail', amount: 45, stable: 95 },
    { source: 'Dépôts corporate', amount: 25, stable: 75 },
    { source: 'Interbancaire', amount: 15, stable: 40 },
    { source: 'Émissions obligataires', amount: 10, stable: 85 },
    { source: 'Autres', amount: 5, stable: 60 }
  ];

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
                ALM & Liquidity Management
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestion actif-passif et liquidité
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export ALM
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="flex space-x-1 mb-8">
          {['liquidity', 'gap', 'rates', 'stress'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-6 py-3 rounded-lg transition-colors ${
                selectedView === view
                  ? 'bg-indigo-600 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {view === 'liquidity' && 'Liquidité'}
              {view === 'gap' && 'Gap Analysis'}
              {view === 'rates' && 'Taux d\'intérêt'}
              {view === 'stress' && 'Stress Testing'}
            </button>
          ))}
        </div>

        {selectedView === 'liquidity' && (
          <>
            {/* Métriques de liquidité */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {liquidityMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metric.name}
                    </h3>
                    <Droplets className={`h-5 w-5 ${
                      metric.status === 'healthy' || metric.status === 'strong' 
                        ? 'text-blue-500' 
                        : 'text-yellow-500'
                    }`} />
                  </div>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {metric.fullName}
                  </p>
                  <p className="text-2xl font-bold mb-2">
                    {typeof metric.value === 'number' ? `${metric.value}%` : metric.value}
                  </p>
                  <p className={`text-sm ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                  </p>
                  {metric.minimum && (
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Min: {metric.minimum}%
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Buffer de liquidité et concentration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Composition du buffer */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Composition du Buffer de Liquidité (€8.2B)
                </h3>
                <div className="space-y-4">
                  {bufferComposition.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {item.type}
                        </span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          €{item.amount}B ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
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

              {/* Concentration des financements */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sources de Financement
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fundingConcentration}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                      <XAxis dataKey="source" angle={-45} textAnchor="end" height={70} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                      <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="amount" fill="#3B82F6" name="Montant (%)" />
                      <Line type="monotone" dataKey="stable" stroke="#10B981" strokeWidth={2} name="Stabilité (%)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === 'gap' && (
          <>
            {/* Gap Analysis */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Gap Analysis par Maturité (€B)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gapAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="maturity" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="assets" fill="#10B981" name="Actifs" />
                    <Bar dataKey="liabilities" fill="#EF4444" name="Passifs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Métriques de duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Duration Gap
                </h4>
                <p className="text-3xl font-bold text-indigo-500">0.8 ans</p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Actifs: 3.2 ans | Passifs: 2.4 ans
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Convexity
                </h4>
                <p className="text-3xl font-bold text-purple-500">12.5</p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sensibilité aux mouvements de taux
                </p>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  EVE Sensitivity
                </h4>
                <p className="text-3xl font-bold text-green-500">-3.2%</p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Impact +200bps sur valeur économique
                </p>
              </div>
            </div>
          </>
        )}

        {selectedView === 'rates' && (
          <>
            {/* Courbe de taux */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Courbe de Taux
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yieldCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="maturity" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis domain={[3.5, 4.5]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
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
                      dataKey="current" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Actuel"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previous" 
                      stroke="#9CA3AF" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Précédent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impact sur NII */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sensibilité du NII aux Taux
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold mb-2">-100bps</h4>
                  <p className="text-2xl font-bold text-red-500">-€125M</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    -5.2% sur NII annuel
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold mb-2">-50bps</h4>
                  <p className="text-2xl font-bold text-yellow-500">-€62M</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    -2.6% sur NII annuel
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold mb-2">+50bps</h4>
                  <p className="text-2xl font-bold text-green-500">+€58M</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    +2.4% sur NII annuel
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold mb-2">+100bps</h4>
                  <p className="text-2xl font-bold text-green-600">+€115M</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    +4.8% sur NII annuel
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === 'stress' && (
          <>
            {/* Stress test liquidité */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-8`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Stress Test Liquidité
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liquidityStress}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="scenario" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="lcr" fill="#3B82F6" name="LCR (%)" />
                    <Bar dataKey="nsfr" fill="#10B981" name="NSFR (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Actions de contingence */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Plan de Contingence Liquidité
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    Niveau 1 - Surveillance renforcée
                  </h4>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Monitoring quotidien des ratios</li>
                    <li>• Activation ligne BCE de €5B</li>
                    <li>• Réduction prêts interbancaires</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    Niveau 2 - Actions préventives
                  </h4>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Vente d'actifs liquides (€3B)</li>
                    <li>• Activation swaps devises</li>
                    <li>• Suspension dividendes</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    Niveau 3 - Crise de liquidité
                  </h4>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Activation totale lignes backup (€15B)</li>
                    <li>• Titrisation d'urgence portefeuille</li>
                    <li>• Support banque centrale</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ALMLiquidity;