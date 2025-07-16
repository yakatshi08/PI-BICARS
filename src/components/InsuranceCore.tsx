import React, { useState } from 'react';
import { 
  Shield, Calculator, FileCheck, Activity,
  TrendingUp, AlertTriangle, PieChart as PieChartIcon, 
  ArrowUp, ArrowDown, Info
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  RadarArea, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine
} from 'recharts';

export const InsuranceCore: React.FC = () => {
  const { darkMode } = useStore();
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const insuranceMetrics = [
    {
      id: 'scr-coverage',
      name: 'SCR Coverage',
      value: '185%',
      trend: '+8%',
      status: 'healthy',
      icon: Shield,
      color: 'purple',
      description: 'Solvency Capital Requirement'
    },
    {
      id: 'combined-ratio',
      name: 'Combined Ratio',
      value: '94.2%',
      trend: '-2.1%',
      status: 'healthy',
      icon: PieChartIcon,
      color: 'blue',
      description: 'Loss Ratio + Expense Ratio'
    },
    {
      id: 'loss-ratio',
      name: 'Loss Ratio',
      value: '62.5%',
      trend: '-1.5%',
      status: 'healthy',
      icon: TrendingUp,
      color: 'green',
      description: 'Claims / Premiums'
    }
  ];

  // Données pour les graphiques d'assurance
  const solvencyEvolution = [
    { month: 'Jan', SCR: 175, MCR: 165, Combined: 96.5 },
    { month: 'Fév', SCR: 178, MCR: 168, Combined: 95.8 },
    { month: 'Mar', SCR: 180, MCR: 170, Combined: 95.2 },
    { month: 'Avr', SCR: 182, MCR: 172, Combined: 94.8 },
    { month: 'Mai', SCR: 183, MCR: 174, Combined: 94.5 },
    { month: 'Jun', SCR: 185, MCR: 176, Combined: 94.2 }
  ];

  const riskBreakdown = [
    { name: 'Market Risk', value: 180, percentage: 40 },
    { name: 'Underwriting Risk', value: 150, percentage: 33 },
    { name: 'Credit Risk', value: 120, percentage: 27 }
  ];

  const lossRatioData = [
    { category: 'Motor', lossRatio: 65, expenseRatio: 28, combined: 93 },
    { category: 'Property', lossRatio: 58, expenseRatio: 32, combined: 90 },
    { category: 'Health', lossRatio: 70, expenseRatio: 25, combined: 95 },
    { category: 'Life', lossRatio: 45, expenseRatio: 35, combined: 80 },
    { category: 'Liability', lossRatio: 72, expenseRatio: 30, combined: 102 }
  ];

  const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const modules = [
    {
      title: 'Solvency II',
      icon: Shield,
      color: 'purple',
      metrics: ['SCR', 'MCR', 'Own Funds', 'Risk Margin'],
      description: 'Conformité réglementaire Solvency II'
    },
    {
      title: 'Actuarial Analytics',
      icon: Calculator,
      color: 'blue',
      metrics: ['Reserves', 'Triangles', 'Projections'],
      description: 'Analyses actuarielles et projections'
    },
    {
      title: 'Claims & Underwriting',
      icon: FileCheck,
      color: 'green',
      metrics: ['Fraud Detection', 'Pricing', 'Loss Ratio'],
      description: 'Gestion des sinistres et souscription'
    }
  ];

  const getColorClasses = (color: string, type: 'text' | 'bg' | 'border') => {
    const colors = {
      purple: {
        text: 'text-purple-600',
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        border: 'border-purple-500'
      },
      blue: {
        text: 'text-blue-600',
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        border: 'border-blue-500'
      },
      green: {
        text: 'text-green-600',
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
        border: 'border-green-500'
      }
    };
    return colors[color]?.[type] || '';
  };

  const solvencyDetails = {
    'scr-coverage': {
      components: [
        { name: 'Market Risk', value: '180M€', percentage: 40 },
        { name: 'Underwriting Risk', value: '150M€', percentage: 33 },
        { name: 'Credit Risk', value: '120M€', percentage: 27 }
      ],
      totalSCR: '450M€',
      ownFunds: '832M€'
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Insurance Core Module
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('insurance.subtitle', 'Solvency II, métriques techniques et gestion des risques d\'assurance')}
          </p>
        </div>

        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('insurance.kpis', 'Indicateurs clés Solvency II')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insuranceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.id}
                  onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                  className={`rounded-xl p-6 cursor-pointer transition-all ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-lg'
                  } ${selectedMetric === metric.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(metric.color, 'bg')}`}>
                      <Icon className={`h-6 w-6 ${getColorClasses(metric.color, 'text')}`} />
                    </div>
                    {metric.status === 'healthy' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {t('status.compliant', 'Conforme')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.name}
                  </h3>
                  <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.value}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metric.description}
                    </p>
                    <div className={`flex items-center text-sm ${
                      metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend.startsWith('+') ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span className="ml-1">{metric.trend}</span>
                    </div>
                  </div>

                  {selectedMetric === metric.id && metric.id === 'scr-coverage' && (
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Own Funds</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solvencyDetails[metric.id].ownFunds}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>SCR Total</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solvencyDetails[metric.id].totalSCR}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {insuranceMetrics.some(m => parseFloat(m.value) < 100 && m.id.includes('scr')) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
          } border`}>
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {t('insurance.alert.title', 'Vigilance réglementaire')}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {t('insurance.alert.message', 'Tous les ratios Solvency II sont conformes')}
              </p>
            </div>
          </div>
        )}
        
        {/* Section Graphiques - NOUVEAU */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution Solvency II */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('insurance.evolution', 'Évolution Solvency II (6 mois)')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={solvencyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="SCR"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{ fill: '#7C3AED' }}
                  name="SCR Coverage %"
                />
                <Line
                  type="monotone"
                  dataKey="MCR"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#3B82F6' }}
                  name="MCR Coverage %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition des risques SCR */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('insurance.riskBreakdown', 'Répartition SCR par risque')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center space-x-4">
              {riskBreakdown.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    €{item.value}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphique Combined Ratio par branche */}
        <div className={`mb-8 rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('insurance.ratiosByBranch', 'Combined Ratio par branche d\'activité')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lossRatioData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                }}
              />
              <Legend />
              <Bar dataKey="lossRatio" stackId="a" fill="#7C3AED" name="Loss Ratio %" />
              <Bar dataKey="expenseRatio" stackId="a" fill="#3B82F6" name="Expense Ratio %" />
              {/* Ligne de référence à 100% */}
              <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-600 rounded mr-2" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Loss Ratio</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 rounded mr-2" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Expense Ratio</span>
            </div>
            <div className="flex items-center">
              <div className="w-0.5 h-4 bg-red-500 mr-2" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Seuil 100%</span>
            </div>
          </div>
        </div>

        {/* Graphique tendance Combined Ratio */}
        <div className={`mb-8 rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('insurance.combinedTrend', 'Tendance Combined Ratio')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={solvencyEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} domain={[90, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                }}
              />
              <Area
                type="monotone"
                dataKey="Combined"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {/* Ligne de profitabilité à 100% */}
              <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" />
              {/* Zone de profitabilité */}
              <ReferenceLine y={95} stroke="#10B981" strokeDasharray="2 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center text-xs">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Zone verte : Combined Ratio {'<'} 95% (profitable)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div 
                key={index}
                className={`rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <Icon className={`h-8 w-8 mb-4 ${getColorClasses(module.color, 'text')}`} />
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {module.title}
                </h3>
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {module.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {module.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions rapides - NOUVEAU */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className={`p-4 rounded-xl border-2 border-dashed transition-all ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <FileCheck className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('insurance.generateQRT', 'Générer QRT Solvency II')}
            </p>
          </button>

          <button className={`p-4 rounded-xl border-2 border-dashed transition-all ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <Activity className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('insurance.runORSA', 'Lancer analyse ORSA')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};