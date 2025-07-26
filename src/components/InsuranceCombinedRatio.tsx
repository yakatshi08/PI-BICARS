import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  Car, Home, Heart, Briefcase, ArrowLeft,
  Download, Calendar, Info, AlertCircle,
  Target, Percent, Calculator, FileText
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface BranchMetrics {
  name: string;
  icon: React.ElementType;
  premiums: number;
  claims: number;
  expenses: number;
  lossRatio: number;
  expenseRatio: number;
  combinedRatio: number;
  trend: 'up' | 'down' | 'stable';
  performance: 'excellent' | 'good' | 'warning' | 'poor';
}

interface HistoricalData {
  month: string;
  automobile: number;
  habitation: number;
  sante: number;
  responsabilite: number;
  global: number;
}

export const InsuranceCombinedRatio: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Données par branche
  const branchesData: BranchMetrics[] = [
    {
      name: 'Automobile',
      icon: Car,
      premiums: 450,
      claims: 280,
      expenses: 139,
      lossRatio: 62.2,
      expenseRatio: 30.8,
      combinedRatio: 93.0,
      trend: 'down',
      performance: 'excellent'
    },
    {
      name: 'Habitation',
      icon: Home,
      premiums: 380,
      claims: 220,
      expenses: 122,
      lossRatio: 57.9,
      expenseRatio: 32.1,
      combinedRatio: 90.0,
      trend: 'stable',
      performance: 'excellent'
    },
    {
      name: 'Santé',
      icon: Heart,
      premiums: 290,
      claims: 230,
      expenses: 46,
      lossRatio: 79.3,
      expenseRatio: 15.7,
      combinedRatio: 95.0,
      trend: 'up',
      performance: 'good'
    },
    {
      name: 'Responsabilité',
      icon: Briefcase,
      premiums: 180,
      claims: 150,
      expenses: 34,
      lossRatio: 83.3,
      expenseRatio: 18.7,
      combinedRatio: 102.0,
      trend: 'up',
      performance: 'warning'
    }
  ];

  // Calcul des totaux
  const totals = branchesData.reduce((acc, branch) => ({
    premiums: acc.premiums + branch.premiums,
    claims: acc.claims + branch.claims,
    expenses: acc.expenses + branch.expenses
  }), { premiums: 0, claims: 0, expenses: 0 });

  const globalMetrics = {
    lossRatio: (totals.claims / totals.premiums * 100).toFixed(1),
    expenseRatio: (totals.expenses / totals.premiums * 100).toFixed(1),
    combinedRatio: ((totals.claims + totals.expenses) / totals.premiums * 100).toFixed(1)
  };

  // Évolution historique
  const historicalData: HistoricalData[] = [
    { month: 'Jan', automobile: 95, habitation: 91, sante: 93, responsabilite: 105, global: 95.5 },
    { month: 'Fév', automobile: 94, habitation: 92, sante: 94, responsabilite: 104, global: 95.2 },
    { month: 'Mar', automobile: 93, habitation: 91, sante: 94, responsabilite: 103, global: 94.8 },
    { month: 'Avr', automobile: 94, habitation: 90, sante: 95, responsabilite: 102, global: 94.6 },
    { month: 'Mai', automobile: 93, habitation: 90, sante: 95, responsabilite: 103, global: 94.5 },
    { month: 'Jun', automobile: 92, habitation: 91, sante: 94, responsabilite: 102, global: 94.3 },
    { month: 'Jul', automobile: 93, habitation: 90, sante: 95, responsabilite: 101, global: 94.2 },
    { month: 'Aoû', automobile: 92, habitation: 90, sante: 96, responsabilite: 102, global: 94.4 },
    { month: 'Sep', automobile: 93, habitation: 89, sante: 95, responsabilite: 103, global: 94.3 },
    { month: 'Oct', automobile: 92, habitation: 90, sante: 95, responsabilite: 102, global: 94.2 },
    { month: 'Nov', automobile: 93, habitation: 90, sante: 94, responsabilite: 102, global: 94.1 },
    { month: 'Déc', automobile: 93, habitation: 90, sante: 95, responsabilite: 102, global: 94.2 }
  ];

  // Benchmark secteur
  const benchmarkData = [
    { metric: 'Loss Ratio', company: parseFloat(globalMetrics.lossRatio), sector: 72.5, best: 65.0 },
    { metric: 'Expense Ratio', company: parseFloat(globalMetrics.expenseRatio), sector: 28.5, best: 22.0 },
    { metric: 'Combined Ratio', company: parseFloat(globalMetrics.combinedRatio), sector: 101.0, best: 87.0 }
  ];

  // Distribution des coûts
  const costDistribution = [
    { name: 'Sinistres payés', value: 60, color: '#ef4444' },
    { name: 'Frais de gestion', value: 15, color: '#f59e0b' },
    { name: 'Commissions', value: 10, color: '#3b82f6' },
    { name: 'Frais généraux', value: 9, color: '#8b5cf6' },
    { name: 'Bénéfice technique', value: 6, color: '#10b981' }
  ];

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const filteredBranches = selectedBranch === 'all' 
    ? branchesData 
    : branchesData.filter(b => b.name.toLowerCase() === selectedBranch);

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
                Analyse Combined Ratio
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Performance technique détaillée par branche
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="h-5 w-5" />
              Exporter Analyse
            </button>
          </div>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-500" />
              <span className={`text-sm font-medium ${
                parseFloat(globalMetrics.combinedRatio) < 100 ? 'text-green-500' : 'text-red-500'
              }`}>
                {parseFloat(globalMetrics.combinedRatio) < 100 ? '✓ Rentable' : '✗ Non rentable'}
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Combined Ratio Global
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {globalMetrics.combinedRatio}%
            </p>
            <div className="mt-3 text-sm">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loss: {globalMetrics.lossRatio}%</span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Expense: {globalMetrics.expenseRatio}%</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-500" />
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loss Ratio Moyen
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {globalMetrics.lossRatio}%
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sinistres: {totals.claims}M€
            </p>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Calculator className="h-8 w-8 text-blue-500" />
              <Activity className="h-4 w-4 text-gray-500" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Expense Ratio Moyen
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {globalMetrics.expenseRatio}%
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Frais: {totals.expenses}M€
            </p>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Percent className="h-8 w-8 text-orange-500" />
              <Info className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Marge Technique
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {(100 - parseFloat(globalMetrics.combinedRatio)).toFixed(1)}%
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Primes: {totals.premiums}M€
            </p>
          </div>
        </div>

        {/* Analyse par branche */}
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance par Branche d'Activité
            </h2>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">Toutes les branches</option>
              <option value="automobile">Automobile</option>
              <option value="habitation">Habitation</option>
              <option value="sante">Santé</option>
              <option value="responsabilite">Responsabilité</option>
            </select>
          </div>

          <div className="space-y-6">
            {filteredBranches.map((branch) => {
              const Icon = branch.icon;
              return (
                <div key={branch.name} className={`border rounded-lg p-6 ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {branch.name}
                        </h3>
                        <p className={`text-sm ${getPerformanceColor(branch.performance)}`}>
                          Performance {branch.performance}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        branch.combinedRatio < 100 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {branch.combinedRatio}%
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(branch.trend)}
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Combined Ratio
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Primes
                      </p>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {branch.premiums}M€
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sinistres
                      </p>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {branch.claims}M€
                      </p>
                      <p className="text-sm text-orange-500">{branch.lossRatio}%</p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Frais
                      </p>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {branch.expenses}M€
                      </p>
                      <p className="text-sm text-blue-500">{branch.expenseRatio}%</p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Marge
                      </p>
                      <p className={`text-lg font-semibold ${
                        branch.combinedRatio < 100 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(100 - branch.combinedRatio).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression visuelle */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Décomposition du ratio
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Objectif: &lt;95%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-orange-500"
                          style={{ width: `${branch.lossRatio}%` }}
                        />
                        <div 
                          className="bg-blue-500"
                          style={{ width: `${branch.expenseRatio}%` }}
                        />
                        {branch.combinedRatio < 100 && (
                          <div 
                            className="bg-green-500"
                            style={{ width: `${100 - branch.combinedRatio}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution historique */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution Combined Ratio {selectedPeriod}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis domain={[85, 110]} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="automobile" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="habitation" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sante" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="responsabilite" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="global" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmark secteur */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Benchmark vs Secteur
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="metric" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                  }}
                />
                <Legend />
                <Bar dataKey="company" fill="#8b5cf6" name="PI BICARS" />
                <Bar dataKey="sector" fill="#f59e0b" name="Moyenne Secteur" />
                <Bar dataKey="best" fill="#10b981" name="Best in Class" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution des coûts et insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution des coûts */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribution des Coûts
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Insights et recommandations */}
          <div className={`lg:col-span-2 rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Insights & Recommandations
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-green-900/20' : 'bg-green-50'
              } border border-green-500`}>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Performance Globale Excellente
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Combined Ratio de 94.2% - Meilleur que la moyenne du secteur (101%). 
                      Marge technique de 5.8% permettant d'absorber les fluctuations.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
              } border border-yellow-500`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      Attention Branche Responsabilité
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      CR de 102% - Non rentable. Recommandations : réviser la tarification, 
                      renforcer la sélection des risques, optimiser les frais de gestion.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              } border border-blue-500`}>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Opportunités d'Amélioration
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      Expense ratio de 27.6% vs 22% best in class. Potentiel de gain de 5.6pp 
                      via digitalisation et automatisation des processus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};