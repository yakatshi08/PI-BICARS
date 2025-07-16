import React, { useState } from 'react';
import { 
  Building2, TrendingUp, Activity, DollarSign, AlertCircle,
  Shield, Percent, BarChart3, Info, ArrowUp, ArrowDown
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

// 👉 Ajout des imports Recharts
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export const BankingCore: React.FC = () => {
  const { darkMode } = useStore();
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Métriques bancaires principales
  const bankingMetrics = [
    {
      id: 'cet1',
      name: 'CET1 Ratio',
      value: '14.2%',
      trend: '+0.3%',
      status: 'healthy',
      icon: Shield,
      color: 'blue',
      description: 'Common Equity Tier 1'
    },
    {
      id: 'lcr',
      name: 'LCR',
      value: '142%',
      trend: '+5%',
      status: 'healthy',
      icon: Activity,
      color: 'green',
      description: 'Liquidity Coverage Ratio'
    },
    {
      id: 'npl',
      name: 'NPL Ratio',
      value: '2.1%',
      trend: '-0.2%',
      status: 'healthy',
      icon: AlertCircle,
      color: 'purple',
      description: 'Non-Performing Loans'
    }
  ];

  // 👉 Ajout des données pour le graphique d'évolution
  const evolutionData = [
    { month: 'Jan', CET1: 13.5, LCR: 135, NPL: 2.5 },
    { month: 'Fév', CET1: 13.7, LCR: 138, NPL: 2.4 },
    { month: 'Mar', CET1: 13.9, LCR: 140, NPL: 2.3 },
    { month: 'Avr', CET1: 14.0, LCR: 139, NPL: 2.2 },
    { month: 'Mai', CET1: 14.1, LCR: 141, NPL: 2.1 },
    { month: 'Jun', CET1: 14.2, LCR: 142, NPL: 2.1 }
  ];

  const modules = [
    {
      title: 'Ratios Bâle III',
      icon: Building2,
      color: 'blue',
      metrics: ['CET1', 'LCR', 'NSFR', 'Leverage Ratio'],
      description: 'Ratios prudentiels réglementaires'
    },
    {
      title: 'Credit Risk',
      icon: TrendingUp,
      color: 'green',
      metrics: ['PD', 'LGD', 'EAD', 'Stress Testing'],
      description: 'Gestion du risque de crédit'
    },
    {
      title: 'ALM & Liquidity',
      icon: Activity,
      color: 'purple',
      metrics: ['Gap Analysis', 'Duration', 'Convexity'],
      description: 'Gestion actif-passif et liquidité'
    }
  ];

  const getColorClasses = (color: string, type: 'text' | 'bg' | 'border') => {
    const colors = {
      blue: {
        text: 'text-blue-600',
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        border: 'border-blue-500'
      },
      green: {
        text: 'text-green-600',
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
        border: 'border-green-500'
      },
      purple: {
        text: 'text-purple-600',
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        border: 'border-purple-500'
      }
    };
    return colors[color]?.[type] || '';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Banking Core Module
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('banking.subtitle', 'Métriques prudentielles et gestion des risques bancaires')}
          </p>
        </div>

        {/* Section KPIs */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('banking.kpis', 'Indicateurs clés')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankingMetrics.map((metric) => {
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
                        {t('status.healthy', 'Sain')}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* 👉 Graphique d'évolution (NOUVEAU) */}
        <div className={`mb-8 rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Évolution des ratios prudentiels (6 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                }}
              />
              <Line type="monotone" dataKey="CET1" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} name="CET1 %" />
              <Line type="monotone" dataKey="LCR" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="LCR %" />
              <Line type="monotone" dataKey="NPL" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} name="NPL %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Modules */}
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

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className={`p-4 rounded-xl border-2 border-dashed transition-all ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <BarChart3 className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('banking.generateReport', 'Générer un rapport COREP')}
            </p>
          </button>

          <button className={`p-4 rounded-xl border-2 border-dashed transition-all ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <Info className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('banking.stressTest', 'Lancer un stress test')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
