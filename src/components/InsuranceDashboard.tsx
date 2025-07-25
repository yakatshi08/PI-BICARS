import React, { useState } from 'react';
import {
  Shield, TrendingUp, AlertTriangle, Activity,
  DollarSign, Users, FileText, BarChart3,
  PieChart, Target, Briefcase, Heart,
  Car, Home, ChevronRight, Info
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

// Types pour les métriques Solvency II
interface SolvencyMetric {
  label: string;
  value: number;
  unit: string;
  threshold?: number;
  trend?: 'up' | 'down' | 'stable';
  variation?: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface BusinessLine {
  name: string;
  icon: React.ElementType;
  premiums: number;
  claims: number;
  combinedRatio: number;
  growth: string;
}

export const InsuranceDashboard: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2024');

  // KPIs Solvency II principaux
  const solvencyMetrics: Record<string, SolvencyMetric> = {
    scr: {
      label: 'SCR Coverage Ratio',
      value: 185,
      unit: '%',
      threshold: 100,
      trend: 'up',
      variation: '+12pp',
      status: 'healthy'
    },
    mcr: {
      label: 'MCR Coverage Ratio',
      value: 420,
      unit: '%',
      threshold: 100,
      trend: 'stable',
      variation: '+5pp',
      status: 'healthy'
    },
    ownFunds: {
      label: 'Fonds Propres Éligibles',
      value: 832,
      unit: 'M€',
      trend: 'up',
      variation: '+8.5%',
      status: 'healthy'
    },
    combinedRatio: {
      label: 'Combined Ratio Global',
      value: 94.2,
      unit: '%',
      threshold: 100,
      trend: 'down',
      variation: '-2.3pp',
      status: 'healthy'
    }
  };

  // Branches d'activité
  const businessLines: BusinessLine[] = [
    { name: 'Automobile', icon: Car, premiums: 450, claims: 280, combinedRatio: 93, growth: '+5.2%' },
    { name: 'Habitation', icon: Home, premiums: 380, claims: 220, combinedRatio: 90, growth: '+7.8%' },
    { name: 'Santé', icon: Heart, premiums: 290, claims: 230, combinedRatio: 95, growth: '+12.3%' },
    { name: 'Responsabilité', icon: Briefcase, premiums: 180, claims: 150, combinedRatio: 102, growth: '+3.1%' }
  ];

  // Données pour les graphiques
  const scrEvolution = [
    { month: 'Jul', scr: 165, mcr: 380, requirement: 100 },
    { month: 'Août', scr: 170, mcr: 390, requirement: 100 },
    { month: 'Sep', scr: 168, mcr: 385, requirement: 100 },
    { month: 'Oct', scr: 175, mcr: 400, requirement: 100 },
    { month: 'Nov', scr: 180, mcr: 410, requirement: 100 },
    { month: 'Déc', scr: 185, mcr: 420, requirement: 100 }
  ];

  const riskBreakdown = [
    { name: 'Market Risk', value: 180, percentage: 40 },
    { name: 'Underwriting Risk', value: 150, percentage: 33 },
    { name: 'Credit Risk', value: 80, percentage: 18 },
    { name: 'Operational Risk', value: 40, percentage: 9 }
  ];

  const combinedRatioByLine = businessLines.map(line => ({
    branch: line.name,
    lossRatio: line.claims / line.premiums * 100,
    expenseRatio: line.combinedRatio - (line.claims / line.premiums * 100),
    combinedRatio: line.combinedRatio
  }));

  // Tier de capital
  const capitalTiers = [
    { tier: 'Tier 1', amount: 750, percentage: 90, quality: 'Unrestricted' },
    { tier: 'Tier 2', amount: 82, percentage: 10, quality: 'Restricted' },
    { tier: 'Tier 3', amount: 0, percentage: 0, quality: 'Ancillary' }
  ];

  // Couleurs pour les graphiques
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Fonction pour générer le rapport QRT - VERSION CORRIGÉE
  const generateQRTReport = () => {
    console.log('Génération du rapport QRT...'); // Pour debug
    
    // Données du rapport QRT
    const qrtData = {
      reportDate: new Date().toLocaleDateString('fr-FR'),
      reportingEntity: 'PI BICARS Assurance SA',
      reportingPeriod: selectedPeriod,
      templates: [
        { code: 'S.02.01', name: 'Bilan', status: 'Complété' },
        { code: 'S.05.01', name: 'Primes et sinistres', status: 'Complété' },
        { code: 'S.12.01', name: 'Provisions techniques Vie', status: 'Complété' },
        { code: 'S.17.01', name: 'Provisions techniques Non-Vie', status: 'Complété' },
        { code: 'S.23.01', name: 'Fonds propres', status: 'Complété' },
        { code: 'S.25.01', name: 'SCR - Formule standard', status: 'Complété' },
        { code: 'S.28.01', name: 'MCR', status: 'Complété' }
      ],
      keyMetrics: {
        scr: solvencyMetrics.scr.value,  // CORRIGÉ: Utilise la bonne référence
        mcr: solvencyMetrics.mcr.value,  // CORRIGÉ: Utilise la bonne référence
        ownFunds: solvencyMetrics.ownFunds.value,  // CORRIGÉ: Utilise la bonne référence
        combinedRatio: solvencyMetrics.combinedRatio.value  // CORRIGÉ: Utilise la bonne référence
      }
    };

    // Générer le contenu XML (format QRT simplifié)
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<QRTReport xmlns="http://www.eiopa.europa.eu/xbrl/s2md">
  <Header>
    <ReportingEntity>${qrtData.reportingEntity}</ReportingEntity>
    <ReportingPeriod>${qrtData.reportingPeriod}</ReportingPeriod>
    <GenerationDate>${qrtData.reportDate}</GenerationDate>
  </Header>
  <Templates>
    ${qrtData.templates.map(t => `
    <Template code="${t.code}">
      <Name>${t.name}</Name>
      <Status>${t.status}</Status>
    </Template>`).join('')}
  </Templates>
  <KeyMetrics>
    <SCRRatio>${qrtData.keyMetrics.scr}%</SCRRatio>
    <MCRRatio>${qrtData.keyMetrics.mcr}%</MCRRatio>
    <EligibleOwnFunds>${qrtData.keyMetrics.ownFunds}M€</EligibleOwnFunds>
    <CombinedRatio>${qrtData.keyMetrics.combinedRatio}%</CombinedRatio>
  </KeyMetrics>
</QRTReport>`;

    try {
      // Créer et télécharger le fichier
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRT_Report_${selectedPeriod.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Rapport QRT généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport QRT');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard Assurance - Solvency II
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Vue d'ensemble de la solvabilité et performance
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              <option value="Q4-2024">Q4 2024</option>
              <option value="Q3-2024">Q3 2024</option>
              <option value="Q2-2024">Q2 2024</option>
            </select>
            <button
              onClick={generateQRTReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Rapports QRT
            </button>
            <button
              onClick={() => navigate('/insurance/risk-analysis')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Analyse des Risques
            </button>
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Object.entries(solvencyMetrics).map(([key, metric]) => (
            <div 
              key={key}
              className={`rounded-xl p-6 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Shield className={`h-6 w-6 ${getStatusColor(metric.status)}`} />
                </div>
                {metric.trend && (
                  <span className={`text-2xl ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                )}
              </div>
              <h3 className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {metric.label}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {metric.value}
                </span>
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.unit}
                </span>
                {metric.variation && (
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {metric.variation}
                  </span>
                )}
              </div>
              
              {/* MODIFICATION APPLIQUÉE ICI - Fonds Propres Éligibles */}
              {key === 'ownFunds' ? (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Objectif: 750M€
                    </span>
                    <span className="text-sm text-green-500 font-medium">Conforme</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              ) : metric.threshold ? (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Seuil: {metric.threshold}{metric.unit}
                    </span>
                    <span className={getStatusColor(metric.status)}>
                      {metric.status === 'healthy' ? 'Conforme' : 
                       metric.status === 'warning' ? 'Attention' : 'Critique'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min((metric.value / (metric.threshold * 2)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/insurance/scr-detail')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Shield className="h-5 w-5" />
              Analyse SCR/MCR Détaillée
            </button>
            <button 
              onClick={generateQRTReport}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
              Rapports QRT
            </button>
            <button 
              onClick={() => navigate('/insurance/risk-analysis')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              Analyse des Risques
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Évolution SCR/MCR */}
          <div className={`lg:col-span-2 rounded-xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Évolution des Ratios de Solvabilité
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>SCR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>MCR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Seuil</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scrEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                />
                <YAxis 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  domain={[0, 450]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scr" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', r: 4 }}
                  name="SCR Coverage"
                />
                <Line 
                  type="monotone" 
                  dataKey="mcr" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  name="MCR Coverage"
                />
                <Line 
                  type="monotone" 
                  dataKey="requirement" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Seuil minimum"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition des risques */}
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Répartition du SCR par Risque
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={riskBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskBreakdown.map((risk, index) => (
                <div key={risk.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {risk.name}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {risk.value}M€
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Combined Ratio par branche */}
        <div className={`mt-6 rounded-xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Combined Ratio par Branche d'Activité
            </h2>
            <button
              onClick={() => navigate('/insurance/combined-ratio')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Voir détails
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedRatioByLine}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="branch" 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                />
                <YAxis 
                  stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                  domain={[0, 120]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
                  }}
                />
                <Bar dataKey="lossRatio" stackId="a" fill="#6366F1" name="Loss Ratio" />
                <Bar dataKey="expenseRatio" stackId="a" fill="#10B981" name="Expense Ratio" />
              </BarChart>
            </ResponsiveContainer>

            {/* Tableau détaillé */}
            <div className="space-y-4">
              {businessLines.map((line) => {
                const Icon = line.icon;
                return (
                  <div 
                    key={line.name}
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-indigo-500" />
                        <span className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {line.name}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        line.combinedRatio < 100 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        CR: {line.combinedRatio}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Primes
                        </span>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {line.premiums}M€
                        </p>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Sinistres
                        </span>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {line.claims}M€
                        </p>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Croissance
                        </span>
                        <p className={`font-medium text-green-500`}>
                          {line.growth}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tiers de capital */}
        <div className={`mt-6 rounded-xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Structure des Fonds Propres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capitalTiers.map((tier) => (
              <div 
                key={tier.tier}
                className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tier.tier}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {tier.quality}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {tier.percentage}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Montant
                    </span>
                    <span className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tier.amount}M€
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-4 rounded-lg ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          } border border-blue-500`}>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Qualité des fonds propres :</strong> 90% de Tier 1 (objectif min: 50%). 
                  La structure actuelle offre une excellente capacité d'absorption des pertes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};