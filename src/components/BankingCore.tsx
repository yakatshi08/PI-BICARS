import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, TrendingUp, Activity, DollarSign, AlertCircle,
  Shield, Percent, BarChart3, Info, ArrowUp, ArrowDown, Lightbulb,
  Bot, Sparkles
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { BankingMetric, BankingThreshold } from '../types/banking.types';

// 👉 Ajout des imports Recharts
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// 📌 AJOUTER ICI les interfaces
interface BankingMetrics {
  nii: number;
  lcr: number;
  nsfr: number;
  cet1: number;
  npl: number;
}

interface MetricDetails {
  id: string;
  name: string;
  value: string;
  trend: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: any;
  color: string;
  description: string;
  path: string;
}

export const BankingCore: React.FC = () => {
  const { darkMode } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Effet pour le rechargement des données
  useEffect(() => {
    setSelectedMetric(null);
  }, []);

  // Fonction pour déterminer le statut
  const getMetricStatus = (value: number, threshold: BankingThreshold): 'healthy' | 'warning' | 'critical' => {
    if (threshold.min !== undefined) {
      if (value < threshold.min) return 'critical';
      if (value < threshold.warning) return 'warning';
      return 'healthy';
    } else if (threshold.max !== undefined) {
      if (value > threshold.max) return 'critical';
      if (value > threshold.warning) return 'warning';
      return 'healthy';
    }
    return 'healthy';
  };

  // Métriques bancaires avec valeurs réalistes
  const bankingMetrics: BankingMetric[] = [
    {
      id: 'cet1',
      name: 'CET1 Ratio',
      value: '14.2%',
      numericValue: 14.2,
      trend: '+0.3%',
      status: 'healthy',
      icon: Shield,
      color: 'blue',
      description: 'Common Equity Tier 1',
      path: '/ratios/cet1',
      threshold: { min: 4.5, warning: 8, good: 10 }
    },
    {
      id: 'lcr',
      name: 'LCR',
      value: '142%',
      numericValue: 142,
      trend: '+5%',
      status: 'healthy',
      icon: Activity,
      color: 'green',
      description: 'Liquidity Coverage Ratio',
      path: '/ratios/lcr',
      threshold: { min: 100, warning: 110, good: 120 }
    },
    {
      id: 'npl',
      name: 'NPL Ratio',
      value: '2.0%',
      numericValue: 2.0,
      trend: '-0.2%',
      status: 'healthy',
      icon: AlertCircle,
      color: 'purple',
      description: 'Non-Performing Loans',
      path: '/ratios/npl',
      threshold: { max: 5, warning: 3, good: 2 }
    },
    {
      id: 'nii',
      name: 'NII',
      value: '€2.3B',
      numericValue: 2300,
      trend: '+12%',
      status: 'healthy',
      icon: DollarSign,
      color: 'indigo',
      description: 'Net Interest Income',
      path: '/ratios/nii',
      threshold: { min: 0, warning: 1000, good: 2000 }
    },
    {
      id: 'nsfr',
      name: 'NSFR',
      value: '118%',
      numericValue: 118,
      trend: '+2%',
      status: 'healthy',
      icon: TrendingUp,
      color: 'teal',
      description: 'Net Stable Funding Ratio',
      path: '/ratios/nsfr',
      threshold: { min: 100, warning: 105, good: 110 }
    }
  ];

  // 👉 Ajout des données pour le graphique d'évolution
  const evolutionData = [
    { month: 'Jan', CET1: 13.5, LCR: 135, NPL: 2.5, NII: 2.0, NSFR: 115 },
    { month: 'Fév', CET1: 13.7, LCR: 138, NPL: 2.4, NII: 2.1, NSFR: 116 },
    { month: 'Mar', CET1: 13.9, LCR: 140, NPL: 2.3, NII: 2.15, NSFR: 116 },
    { month: 'Avr', CET1: 14.0, LCR: 139, NPL: 2.2, NII: 2.2, NSFR: 117 },
    { month: 'Mai', CET1: 14.1, LCR: 141, NPL: 2.1, NII: 2.25, NSFR: 117 },
    { month: 'Jun', CET1: 14.2, LCR: 142, NPL: 2.0, NII: 2.3, NSFR: 118 }
  ];

  const modules = [
    {
      title: 'Ratios Bâle III',
      icon: Building2,
      color: 'blue',
      metrics: ['CET1', 'LCR', 'NSFR', 'Leverage Ratio'],
      description: 'Ratios prudentiels réglementaires',
      path: '/banking/bale-ratios',  // ✅ Corrigé avec /banking/
      number: 1
    },
    {
      title: 'Credit Risk',
      icon: TrendingUp,
      color: 'green',
      metrics: ['PD', 'LGD', 'EAD', 'Stress Testing'],
      description: 'Gestion du risque de crédit',
      path: '/banking/credit-risk',  // ✅ Corrigé avec /banking/
      number: 2
    },
    {
      title: 'ALM & Liquidity',
      icon: Activity,
      color: 'purple',
      metrics: ['Gap Analysis', 'Duration', 'Convexity'],
      description: 'Gestion actif-passif et liquidité',
      path: '/banking/alm-liquidity',  // ✅ CORRECTION ICI : ajout de /banking/
      number: 3
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
      },
      indigo: {
        text: 'text-indigo-600',
        bg: darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50',
        border: 'border-indigo-500'
      },
      teal: {
        text: 'text-teal-600',
        bg: darkMode ? 'bg-teal-900/20' : 'bg-teal-50',
        border: 'border-teal-500'
      }
    };
    return colors[color]?.[type] || '';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': 
        return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'warning':
        return darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Banking Core Module
              </h1>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('banking.subtitle', 'Métriques prudentielles et gestion des risques bancaires')}
              </p>
            </div>
            {/* Bouton ajouté pour le dashboard */}
            <button
              onClick={() => navigate('/banking/dashboard')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Dashboard Exécutif →
            </button>
          </div>
        </div>

        {/* Section KPIs */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('banking.kpis', 'Indicateurs clés')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {bankingMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.id}
                  onClick={() => navigate(metric.path)}
                  className={`rounded-xl p-6 cursor-pointer transition-all ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-lg'
                  } ${selectedMetric === metric.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(metric.color, 'bg')}`}>
                      <Icon className={`h-6 w-6 ${getColorClasses(metric.color, 'text')}`} />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                      {t(`status.${metric.status}`, metric.status === 'healthy' ? 'Sain' : metric.status === 'warning' ? 'Attention' : 'Critique')}
                    </span>
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

        {/* Section AI Insights (NOUVEAU) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              Insights IA
            </h2>
            <button
              onClick={() => navigate('/co-pilot')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Ouvrir Co-Pilot →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight 1: LCR élevé */}
            <div className={`rounded-lg p-4 border ${
              darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'
            }`}>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Opportunité d'optimisation LCR
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Votre LCR de 142% dépasse largement le minimum requis. Considérez d'optimiser l'allocation de vos actifs liquides.
                  </p>
                  <button
                    onClick={() => navigate('/co-pilot?query=Comment optimiser mon LCR')}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Explorer avec l'IA →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Insight 2: Performance NII */}
            <div className={`rounded-lg p-4 border ${
              darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Performance NII exceptionnelle
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Croissance de +12% du NII. Analysez les facteurs de succès pour maintenir cette dynamique.
                  </p>
                  <button
                    onClick={() => navigate('/co-pilot?query=Analyse détaillée du NII')}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Analyser →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 👉 Graphique d'évolution - SECTION CORRIGÉE */}
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
                onClick={() => navigate(module.path)}
                className={`rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer relative ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className={`absolute top-4 right-4 text-6xl font-bold opacity-10 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  {module.number}
                </div>
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
          <button 
            onClick={() => navigate('/corep-report')}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <div className={`absolute top-2 right-4 text-4xl font-bold opacity-10 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
              4
            </div>
            <BarChart3 className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('banking.generateReport', 'Générer un rapport COREP')}
            </p>
          </button>

          <button 
            onClick={() => navigate('/stress-test')}
            className={`p-4 rounded-xl border-2 border-dashed transition-all relative ${
            darkMode 
              ? 'border-gray-700 hover:border-indigo-600 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}>
            <div className={`absolute top-2 right-4 text-4xl font-bold opacity-10 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
              5
            </div>
            <Info className={`h-6 w-6 mb-2 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('banking.stressTest', 'Lancer un stress test')}
            </p>
          </button>
          
          {/* Bouton Co-Pilot IA */}
          <div className="mt-6 text-center col-span-1 md:col-span-2">
            <button
              onClick={() => navigate('/co-pilot')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Bot className="h-5 w-5" />
              <span>Discuter avec le Co-Pilot IA</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};