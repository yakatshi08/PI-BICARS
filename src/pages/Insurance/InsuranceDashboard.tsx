import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, TrendingDown, AlertTriangle, 
  Info, RefreshCw, Download, ArrowLeft, Activity,
  Heart, Umbrella, Car, Home, BarChart3, PieChart,
  AlertCircle, CheckCircle, Target
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import { format } from 'date-fns';

interface SolvencyData {
  date: string;
  scr: number;
  mcr: number;
  ownFunds: number;
  solvencyRatio: number;
}

interface RiskModule {
  name: string;
  value: number;
  icon: any;
  color: string;
  description: string;
}

interface KPIData {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const InsuranceDashboard: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les données
  const [solvencyHistory, setSolvencyHistory] = useState<SolvencyData[]>([]);
  const [currentKPIs, setCurrentKPIs] = useState<KPIData[]>([]);
  const [riskModules, setRiskModules] = useState<RiskModule[]>([]);

  // Générer les données
  useEffect(() => {
    generateSolvencyData();
    generateKPIs();
    generateRiskModules();
  }, [selectedPeriod]);

  const generateSolvencyData = () => {
    const data: SolvencyData[] = [];
    const periods = selectedPeriod === '1M' ? 30 : selectedPeriod === '3M' ? 90 : 365;
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const scr = 100 + Math.random() * 20;
      const mcr = 25 + Math.random() * 10;
      const ownFunds = 180 + Math.random() * 40;
      
      data.push({
        date: format(date, 'dd/MM'),
        scr: scr,
        mcr: mcr,
        ownFunds: ownFunds,
        solvencyRatio: (ownFunds / scr) * 100
      });
    }
    
    setSolvencyHistory(data);
  };

  const generateKPIs = () => {
    setCurrentKPIs([
      {
        label: 'Ratio de Solvabilité',
        value: 198,
        target: 150,
        unit: '%',
        trend: 'up',
        status: 'good',
        description: 'Fonds propres / SCR'
      },
      {
        label: 'SCR Coverage',
        value: 210,
        target: 100,
        unit: 'M€',
        trend: 'stable',
        status: 'good',
        description: 'Solvency Capital Requirement'
      },
      {
        label: 'MCR Coverage',
        value: 45,
        target: 35,
        unit: 'M€',
        trend: 'up',
        status: 'good',
        description: 'Minimum Capital Requirement'
      },
      {
        label: 'Own Funds',
        value: 415,
        target: 300,
        unit: 'M€',
        trend: 'up',
        status: 'good',
        description: 'Fonds propres éligibles'
      }
    ]);
  };

  const generateRiskModules = () => {
    setRiskModules([
      {
        name: 'Risque de Marché',
        value: 45,
        icon: BarChart3,
        color: '#3B82F6',
        description: 'Actions, taux, spread, concentration'
      },
      {
        name: 'Risque Santé',
        value: 20,
        icon: Heart,
        color: '#EF4444',
        description: 'Mortalité, longévité, frais'
      },
      {
        name: 'Risque Vie',
        value: 25,
        icon: Activity,
        color: '#10B981',
        description: 'Rachat, mortalité, catastrophe'
      },
      {
        name: 'Risque Non-Vie',
        value: 35,
        icon: Car,
        color: '#F59E0B',
        description: 'Primes, provisions, catastrophe'
      },
      {
        name: 'Risque Opérationnel',
        value: 15,
        icon: AlertTriangle,
        color: '#8B5CF6',
        description: 'Processus, systèmes, fraude'
      }
    ]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      generateSolvencyData();
      generateKPIs();
      generateRiskModules();
      setIsRefreshing(false);
    }, 1000);
  };

  // Données pour le graphique radial
  const radialData = [
    {
      name: 'SCR',
      value: 198,
      fill: '#3B82F6',
    }
  ];

  // Composition des fonds propres
  const fundsComposition = [
    { name: 'Tier 1', value: 320, color: '#3B82F6' },
    { name: 'Tier 2', value: 75, color: '#8B5CF6' },
    { name: 'Tier 3', value: 20, color: '#10B981' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Bouton Retour */}
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Insurance Dashboard - Solvency II
                </h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Suivi des exigences de capital et ratios de solvabilité
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sélecteur de période */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                {['1M', '3M', '1Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${selectedPeriod === period
                        ? darkMode
                          ? 'bg-gray-600 text-white'
                          : 'bg-white text-gray-900 shadow'
                        : darkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              {/* Boutons d'action */}
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              
              <button
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Download className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentKPIs.map((kpi, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 shadow-lg transition-all hover:shadow-xl
                ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  kpi.status === 'good' ? 'bg-green-100 dark:bg-green-900/30' :
                  kpi.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Shield className={`h-6 w-6 ${
                    kpi.status === 'good' ? 'text-green-600 dark:text-green-400' :
                    kpi.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 text-sm font-medium
                  ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                    kpi.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                   kpi.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                   <Activity className="h-4 w-4" />}
                  <span>
                    {kpi.trend === 'up' ? '+5.2%' : kpi.trend === 'down' ? '-2.1%' : '0%'}
                  </span>
                </div>
              </div>
              
              <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {kpi.label}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {kpi.value}
                </span>
                <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {kpi.unit}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                    Cible: {kpi.target}{kpi.unit}
                  </span>
                  <span className={`font-medium ${
                    kpi.value >= kpi.target ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {kpi.value >= kpi.target ? '✓ Conforme' : '⚠ Attention'}
                  </span>
                </div>
                
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                      kpi.status === 'good' ? 'bg-green-500' :
                      kpi.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution Solvency II */}
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution des indicateurs Solvency II
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={solvencyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="scr" fill="#3B82F6" name="SCR" />
                <Bar yAxisId="left" dataKey="mcr" fill="#10B981" name="MCR" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="solvencyRatio" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Ratio Solvabilité (%)"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Ratio de Solvabilité Radial */}
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ratio de Solvabilité Global
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                  <tspan fill={darkMode ? '#FFFFFF' : '#111827'}>{radialData[0].value}%</tspan>
                </text>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" dy={30} className="text-sm">
                  <tspan fill={darkMode ? '#9CA3AF' : '#6B7280'}>Ratio SCR</tspan>
                </text>
              </RadialBarChart>
            </ResponsiveContainer>

            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Minimum réglementaire
                </span>
                <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  100%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Cible interne
                </span>
                <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  150%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Modules et Composition des fonds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Modules Breakdown */}
          <div className={`rounded-xl p-6 shadow-lg lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Décomposition des modules de risque
            </h2>
            
            <div className="space-y-4">
              {riskModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${module.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: module.color }} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {module.name}
                          </h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {module.value}M€
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{ 
                          width: `${(module.value / 50) * 100}%`,
                          backgroundColor: module.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  SCR Total (après diversification)
                </span>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  210M€
                </span>
              </div>
            </div>
          </div>

          {/* Composition des fonds propres */}
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Fonds propres éligibles
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={fundsComposition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}M€`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fundsComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {fundsComposition.map((fund, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: fund.color }}
                    />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {fund.name}
                    </span>
                  </div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {fund.value}M€
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes réglementaires */}
        <div className={`mt-8 rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Alertes et notifications réglementaires
          </h2>
          
          <div className="space-y-3">
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            } border`}>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                  Ratios de solvabilité conformes
                </h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-green-300/80' : 'text-green-700'}`}>
                  Tous les ratios réglementaires sont au-dessus des seuils minimums. 
                  Marge de sécurité de 48% sur le SCR.
                </p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            } border`}>
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  Rapport RSR à soumettre
                </h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300/80' : 'text-blue-700'}`}>
                  Le rapport RSR (Regular Supervisory Report) doit être soumis avant le 30 avril. 
                  Deadline dans 45 jours.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
            } border`}>
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  Mise à jour du modèle interne
                </h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-300/80' : 'text-yellow-700'}`}>
                  La calibration annuelle du modèle interne est prévue le mois prochain. 
                  Préparer les données historiques sur 5 ans.
                </p>
              </div>
            </div>
          </div>
        </div>
=======
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Tag, Alert } from 'antd';
import { 
  SafetyOutlined, 
  FileProtectOutlined, 
  CalculatorOutlined, 
  FundOutlined,
  AlertOutlined,
  RiseOutlined,
  FallOutlined 
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Types pour les données d'assurance
interface InsuranceMetrics {
  combined_ratio: number;
  loss_ratio: number;
  expense_ratio: number;
  scr_ratio: number;
  mcr_ratio: number;
  roe_insurance: number;
  gross_premiums: number;
  claims_paid: number;
}

interface ClaimsData {
  month: string;
  claims: number;
  premiums: number;
  ratio: number;
}

const InsuranceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [metrics, setMetrics] = useState<InsuranceMetrics>({
    combined_ratio: 94.5,
    loss_ratio: 62.3,
    expense_ratio: 32.2,
    scr_ratio: 168,
    mcr_ratio: 420,
    roe_insurance: 14.2,
    gross_premiums: 45000000,
    claims_paid: 28035000
  });

  // Configuration des couleurs (même palette que le dashboard principal)
  const primaryColor = '#1890ff';
  const successColor = '#52c41a';
  const warningColor = '#faad14';
  const dangerColor = '#ff4d4f';

  // Données pour l'évolution du Combined Ratio
  const combinedRatioTrend = [
    { month: 'Jan', value: 96.2, type: 'Combined Ratio' },
    { month: 'Feb', value: 95.8, type: 'Combined Ratio' },
    { month: 'Mar', value: 95.3, type: 'Combined Ratio' },
    { month: 'Apr', value: 94.9, type: 'Combined Ratio' },
    { month: 'May', value: 94.7, type: 'Combined Ratio' },
    { month: 'Jun', value: 94.5, type: 'Combined Ratio' },
    { month: 'Jan', value: 63.8, type: 'Loss Ratio' },
    { month: 'Feb', value: 63.5, type: 'Loss Ratio' },
    { month: 'Mar', value: 63.1, type: 'Loss Ratio' },
    { month: 'Apr', value: 62.8, type: 'Loss Ratio' },
    { month: 'May', value: 62.5, type: 'Loss Ratio' },
    { month: 'Jun', value: 62.3, type: 'Loss Ratio' },
  ];

  // Configuration du graphique en ligne
  const lineConfig = {
    data: combinedRatioTrend,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: string) => `${v}%`,
      },
    },
    legend: {
      position: 'top' as const,
    },
    smooth: true,
    color: [primaryColor, successColor],
  };

  // Données pour la répartition par ligne de produit
  const productMixData = [
    { type: 'Auto', value: 35, premiums: 15750000 },
    { type: 'Habitation', value: 25, premiums: 11250000 },
    { type: 'Santé', value: 20, premiums: 9000000 },
    { type: 'Vie', value: 15, premiums: 6750000 },
    { type: 'Autres', value: 5, premiums: 2250000 },
  ];

  const pieConfig = {
    data: productMixData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  // Données pour l'évolution des sinistres
  const claimsEvolution = [
    { month: 'Jan', premiums: 7200000, claims: 4500000 },
    { month: 'Feb', premiums: 7350000, claims: 4600000 },
    { month: 'Mar', premiums: 7500000, claims: 4650000 },
    { month: 'Apr', premiums: 7450000, claims: 4580000 },
    { month: 'May', premiums: 7600000, claims: 4700000 },
    { month: 'Jun', premiums: 7650000, claims: 4720000 },
  ];

  const areaConfig = {
    data: claimsEvolution,
    xField: 'month',
    yField: ['premiums', 'claims'],
    geometryOptions: [
      {
        geometry: 'area',
        color: successColor,
      },
      {
        geometry: 'area',
        color: warningColor,
      },
    ],
    legend: {
      position: 'top' as const,
    },
  };

  // Tableau des sinistres majeurs
  const majorClaimsColumns: ColumnsType<any> = [
    {
      title: 'N° Sinistre',
      dataIndex: 'claimId',
      key: 'claimId',
    },
    {
      title: 'Produit',
      dataIndex: 'product',
      key: 'product',
      render: (product) => <Tag color="blue">{product}</Tag>,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `€${value.toLocaleString()}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Réglé' ? 'green' : status === 'En cours' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const majorClaimsData = [
    { key: '1', claimId: 'CLM-2024-001', product: 'Auto', amount: 125000, date: '15/06/2024', status: 'Réglé' },
    { key: '2', claimId: 'CLM-2024-002', product: 'Habitation', amount: 85000, date: '10/06/2024', status: 'En cours' },
    { key: '3', claimId: 'CLM-2024-003', product: 'Santé', amount: 52000, date: '05/06/2024', status: 'Réglé' },
    { key: '4', claimId: 'CLM-2024-004', product: 'Auto', amount: 95000, date: '01/06/2024', status: 'Expertise' },
  ];

  // Fonction pour déterminer la couleur selon le seuil
  const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= threshold ? successColor : dangerColor;
    }
    return value <= threshold ? successColor : dangerColor;
  };

  // Configuration du graphique en colonnes pour Solvency II
  const solvencyData = [
    { type: 'SCR', value: metrics.scr_ratio, requirement: 100 },
    { type: 'MCR', value: metrics.mcr_ratio, requirement: 100 },
  ];

  const columnConfig = {
    data: solvencyData,
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    color: ({ type }: any) => {
      return type === 'SCR' ? primaryColor : successColor;
    },
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
      formatter: (v: any) => `${v.value}%`,
    },
    annotations: [
      {
        type: 'line',
        start: ['min', 100],
        end: ['max', 100],
        style: {
          stroke: dangerColor,
          lineWidth: 2,
          lineDash: [2, 2],
        },
      },
    ],
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <FileProtectOutlined /> Insurance Core Dashboard
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Vue d'ensemble des métriques d'assurance et de la conformité Solvency II
        </p>
      </div>

      {/* Filtres */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 120 }}
            options={[
              { value: 'daily', label: 'Quotidien' },
              { value: 'monthly', label: 'Mensuel' },
              { value: 'quarterly', label: 'Trimestriel' },
              { value: 'yearly', label: 'Annuel' },
            ]}
          />
          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'Tous les produits' },
              { value: 'auto', label: 'Auto' },
              { value: 'habitation', label: 'Habitation' },
              { value: 'sante', label: 'Santé' },
              { value: 'vie', label: 'Vie' },
            ]}
          />
          <RangePicker />
        </Space>
      </Card>

      {/* KPIs principaux */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Combined Ratio"
              value={metrics.combined_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.combined_ratio, 100, false) }}
              prefix={<CalculatorOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.combined_ratio} 
              strokeColor={getMetricColor(metrics.combined_ratio, 100, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 100%
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SCR Ratio"
              value={metrics.scr_ratio}
              precision={0}
              valueStyle={{ color: getMetricColor(metrics.scr_ratio, 100) }}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.scr_ratio > 200 ? 100 : metrics.scr_ratio / 2} 
              strokeColor={getMetricColor(metrics.scr_ratio, 100)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Min. requis: 100%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Loss Ratio"
              value={metrics.loss_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.loss_ratio, 70, false) }}
              prefix={<AlertOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.loss_ratio} 
              strokeColor={getMetricColor(metrics.loss_ratio, 70, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 70%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ROE Assurance"
              value={metrics.roe_insurance}
              precision={1}
              valueStyle={{ color: primaryColor }}
              prefix={<FundOutlined />}
              suffix="%"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <RiseOutlined style={{ color: successColor }} /> +2.1% vs année dernière
            </div>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Évolution Combined & Loss Ratio">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Ratios Solvency II">
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Mix produits et sinistres */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Mix Produits - Primes Brutes">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Sinistres Majeurs du Mois">
            <Table 
              columns={majorClaimsColumns} 
              dataSource={majorClaimsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Graphique primes vs sinistres */}
      <Card title="Évolution Primes vs Sinistres" style={{ marginTop: '24px' }}>
        <Area {...areaConfig} height={250} />
      </Card>

      {/* Alertes */}
      <div style={{ marginTop: '24px' }}>
        <Alert
          message="Conformité Solvency II"
          description="Excellente position de solvabilité avec un ratio SCR de 168% et MCR de 420%. Le Combined Ratio à 94.5% indique une rentabilité technique solide."
          type="success"
          showIcon
        />
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
      </div>
    </div>
  );
};

export default InsuranceDashboard;