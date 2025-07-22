import React, { useState } from 'react';
import { 
  TrendingUp, AlertCircle, CheckCircle, Activity,
  BarChart3, PieChart, Download, Calendar, Shield,
  ArrowUpRight, ArrowDownRight, Minus, FileText, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  RadialBarChart, RadialBar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

// Types pour le dashboard
interface MetricSummary {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: number;
  status: 'healthy' | 'warning' | 'critical';
  vsLastMonth: number;
  vsLastYear: number;
}

export const BankingDashboard: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Données de synthèse
  const metricsSummary: MetricSummary[] = [
    {
      id: 'cet1',
      name: 'CET1 Ratio',
      value: 14.2,
      unit: '%',
      trend: 0.3,
      status: 'healthy',
      vsLastMonth: 0.3,
      vsLastYear: 1.2
    },
    {
      id: 'lcr',
      name: 'LCR',
      value: 142,
      unit: '%',
      trend: 5,
      status: 'healthy',
      vsLastMonth: 5,
      vsLastYear: 12
    },
    {
      id: 'npl',
      name: 'NPL Ratio',
      value: 2.0,
      unit: '%',
      trend: -0.2,
      status: 'healthy',
      vsLastMonth: -0.2,
      vsLastYear: -0.8
    },
    {
      id: 'nii',
      name: 'NII',
      value: 2.3,
      unit: 'B€',
      trend: 12,
      status: 'healthy',
      vsLastMonth: 1.2,
      vsLastYear: 12
    },
    {
      id: 'nsfr',
      name: 'NSFR',
      value: 118,
      unit: '%',
      trend: 2,
      status: 'healthy',
      vsLastMonth: 2,
      vsLastYear: 8
    }
  ];

  // Données pour le graphique d'évolution
  const trendData = {
    '1M': [
      { date: 'S1', CET1: 14.0, LCR: 140, NPL: 2.1, NSFR: 117 },
      { date: 'S2', CET1: 14.1, LCR: 141, NPL: 2.0, NSFR: 117 },
      { date: 'S3', CET1: 14.1, LCR: 141, NPL: 2.0, NSFR: 118 },
      { date: 'S4', CET1: 14.2, LCR: 142, NPL: 2.0, NSFR: 118 }
    ],
    '3M': [
      { date: 'Oct', CET1: 13.8, LCR: 138, NPL: 2.3, NSFR: 115 },
      { date: 'Nov', CET1: 14.0, LCR: 140, NPL: 2.2, NSFR: 116 },
      { date: 'Déc', CET1: 14.2, LCR: 142, NPL: 2.0, NSFR: 118 }
    ],
    '6M': [
      { date: 'Jul', CET1: 13.5, LCR: 135, NPL: 2.5, NSFR: 115 },
      { date: 'Aoû', CET1: 13.7, LCR: 138, NPL: 2.4, NSFR: 116 },
      { date: 'Sep', CET1: 13.9, LCR: 140, NPL: 2.3, NSFR: 116 },
      { date: 'Oct', CET1: 14.0, LCR: 139, NPL: 2.2, NSFR: 117 },
      { date: 'Nov', CET1: 14.1, LCR: 141, NPL: 2.1, NSFR: 117 },
      { date: 'Déc', CET1: 14.2, LCR: 142, NPL: 2.0, NSFR: 118 }
    ],
    '1Y': Array.from({ length: 12 }, (_, i) => ({
      date: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i],
      CET1: 13.0 + (i * 0.1),
      LCR: 130 + i,
      NPL: 2.8 - (i * 0.066),
      NSFR: 110 + (i * 0.66)
    }))
  };

  // Données pour le diagramme de conformité
  const complianceData = [
    { name: 'CET1', value: 14.2, min: 4.5, target: 10.5, max: 20 },
    { name: 'LCR', value: 142, min: 100, target: 120, max: 200 },
    { name: 'NSFR', value: 118, min: 100, target: 110, max: 150 },
    { name: 'NPL', value: 98, min: 0, target: 95, max: 100 } // Inversé (100 - 2.0)
  ];

  // Distribution du portefeuille
  const portfolioData = [
    { name: 'Prêts Corporate', value: 45, amount: '€1.04B' },
    { name: 'Prêts Retail', value: 30, amount: '€690M' },
    { name: 'Prêts Immobiliers', value: 20, amount: '€460M' },
    { name: 'Autres', value: 5, amount: '€115M' }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number, isNegativeGood: boolean = false) => {
    if (isNegativeGood) {
      return trend < 0 ? 'text-green-600' : trend > 0 ? 'text-red-600' : 'text-gray-500';
    }
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard Exécutif Banking
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Vue d'ensemble des métriques prudentielles et performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/banking/simulation')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Simulation 3 ans
            </button>
            <button
              onClick={() => navigate('/banking/stress-test')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Stress Test
            </button>
            <button
              onClick={() => navigate('/banking/corep-export')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export COREP
            </button>
            <button
              onClick={() => navigate('/credit-risk')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Credit Risk
            </button>
          </div>
        </div>

        {/* Métriques clés en cartes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {metricsSummary.map((metric) => (
            <div
              key={metric.id}
              className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => navigate(`/banking/metrics/${metric.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.name}
                </span>
                {metric.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : metric.status === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.value}
                  </span>
                  <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.unit}
                  </span>
                </div>
                <div className={`flex items-center ${getTrendColor(metric.trend, metric.id === 'npl')}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm font-medium">
                    {Math.abs(metric.trend)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                    vs mois: {metric.vsLastMonth > 0 ? '+' : ''}{metric.vsLastMonth}%
                  </span>
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                    vs année: {metric.vsLastYear > 0 ? '+' : ''}{metric.vsLastYear}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Évolution temporelle */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Évolution des Ratios Prudentiels
              </h3>
              <div className="flex gap-2">
                {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-indigo-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData[selectedPeriod]}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="CET1" stroke="#6366f1" strokeWidth={2} name="CET1 %" />
                <Line type="monotone" dataKey="LCR" stroke="#10b981" strokeWidth={2} name="LCR %" />
                <Line type="monotone" dataKey="NSFR" stroke="#f59e0b" strokeWidth={2} name="NSFR %" />
                <Line type="monotone" dataKey="NPL" stroke="#ef4444" strokeWidth={2} name="NPL %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Diagramme de conformité */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Conformité Réglementaire
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={complianceData}>
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  fill="#6366f1"
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution du portefeuille et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution portefeuille */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribution du Portefeuille
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {portfolioData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alertes et recommandations */}
          <div className={`rounded-xl p-6 lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Alertes & Recommandations IA
            </h3>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Optimisation LCR possible
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Votre LCR de 142% dépasse de 42 points le minimum requis. Une réallocation de 20% des actifs liquides pourrait améliorer le rendement de 0.3%.
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Voir simulation →
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border border-green-500`}>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Performance NII remarquable
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      La croissance du NII (+12% YoY) dépasse les objectifs. Les facteurs clés : hausse des taux (+2.5%) et volume de crédit (+8%).
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