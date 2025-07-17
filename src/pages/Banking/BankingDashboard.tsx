import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { 
  TrendingUp, TrendingDown, DollarSign, Shield, Activity, 
  AlertTriangle, Info, RefreshCw, Download, Calendar,
  BarChart3, PieChart, Target, Percent, ArrowLeft
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { format } from 'date-fns';

interface RatioData {
  date: string;
  tier1: number;
  car: number;
  lcr: number;
  nsfr: number;
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

const BankingDashboard: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ratioHistory, setRatioHistory] = useState<RatioData[]>([]);
  const [currentKPIs, setCurrentKPIs] = useState<KPIData[]>([]);

  useEffect(() => {
    generateHistoricalData();
    generateKPIs();
  }, [selectedPeriod]);

  const generateHistoricalData = () => {
    const data: RatioData[] = [];
    const periods = selectedPeriod === '1M' ? 30 : selectedPeriod === '3M' ? 90 : 365;
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: format(date, 'dd/MM'),
        tier1: 12 + Math.random() * 2,
        car: 15 + Math.random() * 3,
        lcr: 120 + Math.random() * 30,
        nsfr: 110 + Math.random() * 20
      });
    }
    
    setRatioHistory(data);
  };

  const generateKPIs = () => {
    setCurrentKPIs([
      {
        label: 'Tier 1 Capital Ratio',
        value: 13.5,
        target: 10.5,
        unit: '%',
        trend: 'up',
        status: 'good',
        description: 'Ratio de fonds propres de base'
      },
      {
        label: 'Capital Adequacy Ratio (CAR)',
        value: 16.8,
        target: 13,
        unit: '%',
        trend: 'stable',
        status: 'good',
        description: 'Ratio de solvabilité total'
      },
      {
        label: 'Liquidity Coverage Ratio (LCR)',
        value: 135,
        target: 100,
        unit: '%',
        trend: 'up',
        status: 'good',
        description: 'Ratio de liquidité à court terme'
      },
      {
        label: 'Net Stable Funding Ratio (NSFR)',
        value: 115,
        target: 100,
        unit: '%',
        trend: 'down',
        status: 'warning',
        description: 'Ratio de financement stable'
      }
    ]);
  };

  // Fonction de rafraîchissement ajoutée
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      generateHistoricalData();
      generateKPIs();
      setIsRefreshing(false);
    }, 1000);
  };

  const pieData = [
    { name: 'Tier 1', value: 65, color: '#3B82F6' },
    { name: 'Tier 2', value: 20, color: '#8B5CF6' },
    { name: 'Tier 3', value: 15, color: '#10B981' }
  ];

  const chartColors = {
    tier1: '#3B82F6',
    car: '#8B5CF6',
    lcr: '#10B981',
    nsfr: '#F59E0B'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                  Banking Dashboard - Tableau de bord réglementaire
                </h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Suivi en temps réel des ratios prudentiels et de solvabilité
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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

      <div className="p-6">
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
                    {kpi.trend === 'up' ? '+2.3%' : kpi.trend === 'down' ? '-1.5%' : '0%'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution des ratios de solvabilité
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ratioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
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
                  labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tier1"
                  stroke={chartColors.tier1}
                  strokeWidth={2}
                  name="Tier 1"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="car"
                  stroke={chartColors.car}
                  strokeWidth={2}
                  name="CAR"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ratios de liquidité
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ratioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
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
                <Area
                  type="monotone"
                  dataKey="lcr"
                  stroke={chartColors.lcr}
                  fill={chartColors.lcr}
                  fillOpacity={0.3}
                  name="LCR"
                />
                <Area
                  type="monotone"
                  dataKey="nsfr"
                  stroke={chartColors.nsfr}
                  fill={chartColors.nsfr}
                  fillOpacity={0.3}
                  name="NSFR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Composition du capital
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl p-6 shadow-lg lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Alertes réglementaires
            </h2>
            
            <div className="space-y-3">
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
              } border`}>
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    NSFR proche du seuil minimum
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-300/80' : 'text-yellow-700'}`}>
                    Le ratio NSFR est à 115%, proche du minimum réglementaire de 100%. 
                    Envisager d'augmenter les sources de financement stable.
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              } border`}>
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                    Stress test prévu
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300/80' : 'text-blue-700'}`}>
                    Le prochain stress test réglementaire est prévu dans 15 jours. 
                    Préparer les scénarios adverses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
=======
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Tag, Alert } from 'antd';
import { 
  DollarOutlined, 
  BankOutlined, 
  LineChartOutlined, 
  SafetyOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined 
} from '@ant-design/icons';
import { Line, Column, Pie, Gauge } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Types pour les données bancaires
interface BankingMetrics {
  nii: number;
  lcr: number;
  nsfr: number;
  cet1: number;
  npl_ratio: number;
  roe: number;
  total_assets: number;
  total_loans: number;
}

interface TrendData {
  date: string;
  value: number;
  type: string;
}

const BankingDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [metrics, setMetrics] = useState<BankingMetrics>({
    nii: 3.24,
    lcr: 125.5,
    nsfr: 118.2,
    cet1: 14.8,
    npl_ratio: 2.3,
    roe: 12.5,
    total_assets: 125000000,
    total_loans: 87500000
  });

  // Configuration des graphiques avec les mêmes couleurs que le dashboard principal
  const primaryColor = '#1890ff';
  const successColor = '#52c41a';
  const warningColor = '#faad14';
  const dangerColor = '#ff4d4f';

  // Données pour le graphique de tendance
  const trendData: TrendData[] = [
    { date: 'Jan', value: 14.2, type: 'CET1' },
    { date: 'Feb', value: 14.3, type: 'CET1' },
    { date: 'Mar', value: 14.5, type: 'CET1' },
    { date: 'Apr', value: 14.6, type: 'CET1' },
    { date: 'May', value: 14.7, type: 'CET1' },
    { date: 'Jun', value: 14.8, type: 'CET1' },
    { date: 'Jan', value: 120.5, type: 'LCR' },
    { date: 'Feb', value: 122.3, type: 'LCR' },
    { date: 'Mar', value: 123.1, type: 'LCR' },
    { date: 'Apr', value: 124.2, type: 'LCR' },
    { date: 'May', value: 124.8, type: 'LCR' },
    { date: 'Jun', value: 125.5, type: 'LCR' },
  ];

  // Configuration du graphique en ligne
  const lineConfig = {
    data: trendData,
    xField: 'date',
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
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: [primaryColor, successColor],
  };

  // Données pour la répartition du portefeuille
  const portfolioData = [
    { type: 'Corporate', value: 35 },
    { type: 'Retail', value: 25 },
    { type: 'SME', value: 20 },
    { type: 'Real Estate', value: 15 },
    { type: 'Other', value: 5 },
  ];

  const pieConfig = {
    data: portfolioData,
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

  // Configuration du gauge pour le CET1
  const gaugeConfig = {
    percent: metrics.cet1 / 20, // Sur une échelle de 20%
    range: {
      ticks: [0, 0.225, 0.525, 0.75, 1], // 0%, 4.5%, 10.5%, 15%, 20%
      color: ['#FF4D4F', '#FAAD14', '#52C41A', '#1890FF'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        formatter: () => `${metrics.cet1}%`,
      },
    },
  };

  // Tableau des prêts à risque
  const riskLoansColumns: ColumnsType<any> = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `€${value.toLocaleString()}`,
    },
    {
      title: 'PD',
      dataIndex: 'pd',
      key: 'pd',
      render: (value) => `${value}%`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const color = rating <= 'BBB' ? 'green' : rating <= 'BB' ? 'orange' : 'red';
        return <Tag color={color}>{rating}</Tag>;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Performing' ? 'green' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const riskLoansData = [
    { key: '1', client: 'ABC Corp', amount: 2500000, pd: 2.3, rating: 'BBB', status: 'Performing' },
    { key: '2', client: 'XYZ Ltd', amount: 1800000, pd: 5.1, rating: 'BB', status: 'Watch' },
    { key: '3', client: 'DEF Industries', amount: 3200000, pd: 1.2, rating: 'A', status: 'Performing' },
    { key: '4', client: 'GHI Holdings', amount: 900000, pd: 8.7, rating: 'B', status: 'NPL' },
  ];

  // Fonction pour déterminer la couleur selon le seuil
  const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= threshold ? successColor : dangerColor;
    }
    return value <= threshold ? successColor : dangerColor;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <BankOutlined /> Banking Core Dashboard
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Vue d'ensemble des métriques bancaires et de la conformité réglementaire
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
          <RangePicker />
        </Space>
      </Card>

      {/* KPIs principaux */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CET1 Ratio"
              value={metrics.cet1}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.cet1, 10.5) }}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.cet1} 
              strokeColor={getMetricColor(metrics.cet1, 10.5)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Min. requis: 10.5%
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="LCR"
              value={metrics.lcr}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.lcr, 100) }}
              prefix={<DollarOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.lcr > 100 ? 100 : metrics.lcr} 
              strokeColor={getMetricColor(metrics.lcr, 100)}
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
              title="NPL Ratio"
              value={metrics.npl_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.npl_ratio, 3, false) }}
              prefix={<WarningOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.npl_ratio * 10} 
              strokeColor={getMetricColor(metrics.npl_ratio, 3, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 3%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ROE"
              value={metrics.roe}
              precision={1}
              valueStyle={{ color: primaryColor }}
              prefix={<LineChartOutlined />}
              suffix="%"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <ArrowUpOutlined style={{ color: successColor }} /> +1.2% vs année dernière
            </div>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Évolution des Ratios Prudentiels">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="CET1 Ratio - Gauge">
            <Gauge {...gaugeConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Portfolio et tableau */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Répartition du Portefeuille de Prêts">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Prêts à Risque - Top Expositions">
            <Table 
              columns={riskLoansColumns} 
              dataSource={riskLoansData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Alertes */}
      <div style={{ marginTop: '24px' }}>
        <Alert
          message="Conformité Bâle III"
          description="Tous les ratios prudentiels respectent les exigences réglementaires. Le ratio CET1 dispose d'un coussin confortable de 4.3% au-dessus du minimum."
          type="success"
          showIcon
        />
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
      </div>
    </div>
  );
};

export default BankingDashboard;