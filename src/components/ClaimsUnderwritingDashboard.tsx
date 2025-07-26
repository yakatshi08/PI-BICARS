import React, { useState } from 'react';
import {
  Shield, AlertTriangle, TrendingUp, Activity,
  FileText, Users, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowLeft,
  BarChart3, PieChart, Target, Zap,
  Calculator, Brain, Filter, Download
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie,
  Cell, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface ClaimMetrics {
  total: number;
  inProgress: number;
  settled: number;
  rejected: number;
  avgSettlementTime: number;
  fraudSuspected: number;
}

interface UnderwritingMetrics {
  newPolicies: number;
  renewals: number;
  lossRatio: number;
  expenseRatio: number;
  combinedRatio: number;
  avgPremium: number;
}

const ClaimsUnderwritingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState('Q4 2024');
  const [selectedView, setSelectedView] = useState<'claims' | 'underwriting' | 'both'>('both');

  // Métriques des sinistres
  const claimMetrics: ClaimMetrics = {
    total: 1847,
    inProgress: 423,
    settled: 1298,
    rejected: 126,
    avgSettlementTime: 12.5,
    fraudSuspected: 47
  };

  // Métriques de souscription
  const underwritingMetrics: UnderwritingMetrics = {
    newPolicies: 3421,
    renewals: 8756,
    lossRatio: 68.4,
    expenseRatio: 27.2,
    combinedRatio: 95.6,
    avgPremium: 1245
  };

  // Données pour les graphiques
  const claimsEvolution = [
    { month: 'Jan', claims: 145, fraud: 5, avgCost: 3200 },
    { month: 'Fév', claims: 162, fraud: 8, avgCost: 2800 },
    { month: 'Mar', claims: 178, fraud: 6, avgCost: 3500 },
    { month: 'Avr', claims: 156, fraud: 4, avgCost: 3100 },
    { month: 'Mai', claims: 189, fraud: 9, avgCost: 3700 },
    { month: 'Jun', claims: 201, fraud: 7, avgCost: 3400 }
  ];

  const claimsByType = [
    { type: 'Auto', count: 45, amount: 1250000, color: '#3B82F6' },
    { type: 'Habitation', count: 28, amount: 890000, color: '#8B5CF6' },
    { type: 'Santé', count: 62, amount: 420000, color: '#10B981' },
    { type: 'RC Pro', count: 15, amount: 2100000, color: '#F59E0B' },
    { type: 'Autres', count: 12, amount: 340000, color: '#6B7280' }
  ];

  const fraudDetection = [
    { score: '0-20', count: 1423, label: 'Très faible' },
    { score: '20-40', count: 287, label: 'Faible' },
    { score: '40-60', count: 89, label: 'Moyen' },
    { score: '60-80', count: 35, label: 'Élevé' },
    { score: '80-100', count: 13, label: 'Très élevé' }
  ];

  const underwritingPerformance = [
    { product: 'Auto', policies: 4523, premium: 5632000, lossRatio: 65 },
    { product: 'Habitation', policies: 3245, premium: 4123000, lossRatio: 58 },
    { product: 'Santé', policies: 2876, premium: 2456000, lossRatio: 72 },
    { product: 'RC Pro', policies: 1567, premium: 3890000, lossRatio: 45 }
  ];

  const pricingOptimization = [
    { segment: 'Jeunes conducteurs', current: 1800, optimal: 2100, impact: '+16.7%' },
    { segment: 'Familles', current: 1200, optimal: 1150, impact: '-4.2%' },
    { segment: 'Seniors', current: 950, optimal: 1050, impact: '+10.5%' },
    { segment: 'Professionnels', current: 2400, optimal: 2300, impact: '-4.2%' }
  ];

  const totalAmount = claimsByType.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/insurance/dashboard')}
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
            } transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Claims & Underwriting
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestion des sinistres et souscription intelligente
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-800 text-gray-300 border-gray-700' 
                : 'bg-white text-gray-700 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            <option value="Q4 2024">Q4 2024</option>
            <option value="Q3 2024">Q3 2024</option>
            <option value="Q2 2024">Q2 2024</option>
            <option value="2024">Année 2024</option>
          </select>
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedView('claims')}
              className={`px-4 py-2 ${
                selectedView === 'claims' 
                  ? 'bg-purple-600 text-white' 
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              Sinistres
            </button>
            <button
              onClick={() => setSelectedView('underwriting')}
              className={`px-4 py-2 ${
                selectedView === 'underwriting' 
                  ? 'bg-purple-600 text-white' 
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              Souscription
            </button>
            <button
              onClick={() => setSelectedView('both')}
              className={`px-4 py-2 ${
                selectedView === 'both' 
                  ? 'bg-purple-600 text-white' 
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              Vue globale
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Section - COMPLÈTEMENT CORRIGÉE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Claims KPIs */}
        {(selectedView === 'claims' || selectedView === 'both') && (
          <>
            {/* Carte Total - Version corrigée avec barre multicolore */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <FileText className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {claimMetrics.total}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sinistres déclarés
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-yellow-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {claimMetrics.inProgress} en cours
                  </span>
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {claimMetrics.settled} réglés
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden flex">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 transition-all duration-500"
                    style={{ width: `${(claimMetrics.inProgress / claimMetrics.total) * 100}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 transition-all duration-500"
                    style={{ width: `${(claimMetrics.settled / claimMetrics.total) * 100}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 transition-all duration-500"
                    style={{ width: `${(claimMetrics.rejected / claimMetrics.total) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {((claimMetrics.inProgress / claimMetrics.total) * 100).toFixed(0)}%
                  </span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {((claimMetrics.settled / claimMetrics.total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Fraude - Version améliorée */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                  <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fraude
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {claimMetrics.fraudSuspected}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Suspicions de fraude
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Taux de détection
                  </span>
                  <span className="text-red-500 font-medium">
                    {((claimMetrics.fraudSuspected / claimMetrics.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(claimMetrics.fraudSuspected / claimMetrics.total) * 100}%`, minWidth: '25%' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Underwriting KPIs */}
        {(selectedView === 'underwriting' || selectedView === 'both') && (
          <>
            {/* Carte Polices - Version améliorée */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                  <Users className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Polices
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {(underwritingMetrics.newPolicies + underwritingMetrics.renewals).toLocaleString()}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total contrats actifs
              </p>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-500 flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {underwritingMetrics.newPolicies} nouvelles
                    </span>
                    <span className="text-blue-500">
                      {((underwritingMetrics.newPolicies / (underwritingMetrics.newPolicies + underwritingMetrics.renewals)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(underwritingMetrics.newPolicies / (underwritingMetrics.newPolicies + underwritingMetrics.renewals)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-500 flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {underwritingMetrics.renewals} renouvellements
                    </span>
                    <span className="text-purple-500">
                      {((underwritingMetrics.renewals / (underwritingMetrics.newPolicies + underwritingMetrics.renewals)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(underwritingMetrics.renewals / (underwritingMetrics.newPolicies + underwritingMetrics.renewals)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Performance - Version améliorée */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <Target className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Performance
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {underwritingMetrics.combinedRatio}%
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Combined Ratio
              </p>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loss Ratio</span>
                    <span className="text-orange-500 font-medium">{underwritingMetrics.lossRatio}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${underwritingMetrics.lossRatio}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Expense Ratio</span>
                    <span className="text-indigo-500 font-medium">{underwritingMetrics.expenseRatio}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${underwritingMetrics.expenseRatio}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Evolution Chart */}
        {(selectedView === 'claims' || selectedView === 'both') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution des Sinistres
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={claimsEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis yAxisId="left" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis yAxisId="right" orientation="right" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="claims" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Sinistres"
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgCost" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Coût moyen (€)"
                  dot={{ fill: '#10B981', r: 4 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="fraud" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Fraudes"
                  dot={{ fill: '#EF4444', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Claims by Type */}
        {(selectedView === 'claims' || selectedView === 'both') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Répartition par Type de Sinistre
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={claimsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {claimsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${(value / 1000).toFixed(0)}K€`}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {claimsByType.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {type.type}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {type.count} sinistres
                    </span>
                    <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({((type.amount / totalAmount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fraud Detection Score Distribution */}
        {(selectedView === 'claims' || selectedView === 'both') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Score de Détection de Fraude
              </h3>
              <Brain className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fraudDetection}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="score" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {fraudDetection.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index < 2 ? '#10B981' : 
                        index < 3 ? '#F59E0B' : 
                        '#EF4444'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  <span className="font-medium">48 sinistres</span> nécessitent une investigation approfondie (score &gt; 60)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Underwriting Performance */}
        {(selectedView === 'underwriting' || selectedView === 'both') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance par Produit
            </h3>
            <div className="space-y-4">
              {underwritingPerformance.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {product.product}
                    </span>
                    <div className="text-sm">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {product.policies.toLocaleString()} polices
                      </span>
                      <span className={`ml-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {(product.premium / 1000000).toFixed(1)}M€
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className={`h-8 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-500 ${
                          product.lossRatio < 60 ? 'bg-green-500' : 
                          product.lossRatio < 70 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${product.lossRatio}%` }}
                      >
                        Loss Ratio: {product.lossRatio}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Optimization */}
        {(selectedView === 'underwriting' || selectedView === 'both') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Optimisation Tarifaire IA
              </h3>
              <Calculator className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="space-y-4">
              {pricingOptimization.map((segment, index) => (
                <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {segment.segment}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Actuel: {segment.current}€
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          Optimal: {segment.optimal}€
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      segment.impact.startsWith('+') 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {segment.impact}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < 3 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Impact rentabilité
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                💡 Impact total estimé: <span className="font-medium">+3.2% de rentabilité</span> avec ajustement tarifaire
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/claims/management')}
          className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all text-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold">Gestion des Sinistres</h4>
              <p className="text-sm text-blue-100 mt-1">Workflow complet</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </button>

        <button
          onClick={() => navigate('/underwriting/workflow')}
          className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:shadow-lg transition-all text-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold">Workflow Souscription</h4>
              <p className="text-sm text-purple-100 mt-1">Process automatisé</p>
            </div>
            <Shield className="h-8 w-8 text-purple-200" />
          </div>
        </button>

        <button
          onClick={() => navigate('/pricing/optimization')}
          className="p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:shadow-lg transition-all text-white"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold">Tarification IA</h4>
              <p className="text-sm text-green-100 mt-1">Optimisation ML</p>
            </div>
            <Brain className="h-8 w-8 text-green-200" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ClaimsUnderwritingDashboard;