import React, { useState } from 'react';
import {
  Shield, TrendingUp, AlertTriangle, Activity, BarChart3,
  ChevronRight, Info, FileText, CheckCircle, XCircle,
  AlertCircle, Download, Zap, Target, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Types pour le Credit Risk
interface RiskMetric {
  id: string;
  name: string;
  value: number;
  trend: number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

interface RatingDistribution {
  rating: string;
  count: number;
  percentage: number;
  pd: number;
  exposure: number;
}

interface ProvisionData {
  stage: string;
  amount: number;
  ecl: number;
  coverage: number;
  color: string;
}

const CreditRisk: React.FC = () => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'overview' | 'pd-lgd' | 'provisions' | 'validation'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  // Métriques principales
  const riskMetrics: RiskMetric[] = [
    {
      id: 'pd',
      name: 'PD Moyen',
      value: 2.45,
      trend: 0.15,
      status: 'healthy',
      description: 'Probability of Default moyenne du portefeuille'
    },
    {
      id: 'lgd',
      name: 'LGD Moyen',
      value: 35.2,
      trend: -1.2,
      status: 'healthy',
      description: 'Loss Given Default moyenne'
    },
    {
      id: 'ead',
      name: 'EAD Total',
      value: 4250,
      trend: 5.3,
      status: 'warning',
      description: 'Exposure at Default en M€'
    },
    {
      id: 'ecl',
      name: 'ECL Total',
      value: 125.6,
      trend: 8.2,
      status: 'warning',
      description: 'Expected Credit Loss en M€'
    }
  ];

  // Distribution des ratings
  const ratingDistribution: RatingDistribution[] = [
    { rating: 'AAA', count: 45, percentage: 4.5, pd: 0.01, exposure: 450 },
    { rating: 'AA', count: 120, percentage: 12.0, pd: 0.02, exposure: 1200 },
    { rating: 'A', count: 250, percentage: 25.0, pd: 0.05, exposure: 2100 },
    { rating: 'BBB', count: 300, percentage: 30.0, pd: 0.15, exposure: 1800 },
    { rating: 'BB', count: 180, percentage: 18.0, pd: 0.80, exposure: 900 },
    { rating: 'B', count: 80, percentage: 8.0, pd: 3.50, exposure: 400 },
    { rating: 'CCC', count: 25, percentage: 2.5, pd: 15.0, exposure: 150 }
  ];

  // Données IFRS 9 - Provisions par stage
  const provisionData: ProvisionData[] = [
    { stage: 'Stage 1', amount: 2500, ecl: 25, coverage: 1.0, color: '#10b981' },
    { stage: 'Stage 2', amount: 800, ecl: 40, coverage: 5.0, color: '#f59e0b' },
    { stage: 'Stage 3', amount: 300, ecl: 60.6, coverage: 20.2, color: '#ef4444' }
  ];

  // Evolution PD/LGD sur 12 mois
  const pdLgdEvolution = [
    { month: 'Jan', pd: 2.1, lgd: 36.5, ecl: 110 },
    { month: 'Fév', pd: 2.2, lgd: 36.2, ecl: 112 },
    { month: 'Mar', pd: 2.3, lgd: 35.8, ecl: 115 },
    { month: 'Avr', pd: 2.4, lgd: 35.5, ecl: 118 },
    { month: 'Mai', pd: 2.35, lgd: 35.3, ecl: 120 },
    { month: 'Jun', pd: 2.45, lgd: 35.2, ecl: 125.6 }
  ];

  // Matrice de migration
  const migrationMatrix = [
    { from: 'AAA', AAA: 90.5, AA: 8.0, A: 1.5, BBB: 0, BB: 0, B: 0, CCC: 0, D: 0 },
    { from: 'AA', AAA: 0.5, AA: 89.0, A: 9.0, BBB: 1.5, BB: 0, B: 0, CCC: 0, D: 0 },
    { from: 'A', AAA: 0, AA: 2.0, A: 88.0, BBB: 8.5, BB: 1.5, B: 0, CCC: 0, D: 0 },
    { from: 'BBB', AAA: 0, AA: 0, A: 3.0, BBB: 85.0, BB: 10.0, B: 2.0, CCC: 0, D: 0 },
    { from: 'BB', AAA: 0, AA: 0, A: 0, BBB: 5.0, BB: 80.0, B: 12.0, CCC: 3.0, D: 0 },
    { from: 'B', AAA: 0, AA: 0, A: 0, BBB: 0, BB: 5.0, B: 75.0, CCC: 15.0, D: 5.0 },
    { from: 'CCC', AAA: 0, AA: 0, A: 0, BBB: 0, BB: 0, B: 10.0, CCC: 60.0, D: 30.0 }
  ];

  // Backtesting des modèles
  const modelValidation = [
    { model: 'PD Corporate', predicted: 2.5, actual: 2.45, accuracy: 98, status: 'valid' },
    { model: 'PD Retail', predicted: 3.2, actual: 3.35, accuracy: 95.5, status: 'valid' },
    { model: 'LGD Secured', predicted: 25, actual: 24.5, accuracy: 98, status: 'valid' },
    { model: 'LGD Unsecured', predicted: 45, actual: 47, accuracy: 95.7, status: 'warning' },
    { model: 'EAD CCF', predicted: 75, actual: 73, accuracy: 97.3, status: 'valid' }
  ];

  // Calcul du statut global
  const getMetricColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Concentration sectorielle
  const sectorConcentration = [
    { sector: 'Immobilier', exposure: 35, pd: 1.8, lgd: 25 },
    { sector: 'Industrie', exposure: 25, pd: 2.8, lgd: 40 },
    { sector: 'Services', exposure: 20, pd: 2.2, lgd: 35 },
    { sector: 'Commerce', exposure: 15, pd: 3.5, lgd: 45 },
    { sector: 'Autres', exposure: 5, pd: 2.0, lgd: 30 }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                Credit Risk Management
              </h1>
              <p className="mt-1" style={{ color: '#94a3b8' }}>
                Analyse des risques de crédit et provisions IFRS 9
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/banking/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour Banking
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                style={{ backgroundColor: '#10b981' }}
              >
                <Download className="h-4 w-4" />
                Export Rapport
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 mt-6 p-1 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'pd-lgd', label: 'PD/LGD/EAD', icon: TrendingUp },
              { id: 'provisions', label: 'Provisions IFRS 9', icon: Shield },
              { id: 'validation', label: 'Validation Modèles', icon: CheckCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedView === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: selectedView === tab.id ? '#6366f1' : 'transparent'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vue d'ensemble */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {riskMetrics.map(metric => (
                <div
                  key={metric.id}
                  className="rounded-xl p-6"
                  style={{ backgroundColor: '#1e293b' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                      {metric.id === 'pd' ? <Target className="h-6 w-6" style={{ color: '#8b5cf6' }} /> :
                       metric.id === 'lgd' ? <Shield className="h-6 w-6" style={{ color: '#3b82f6' }} /> :
                       metric.id === 'ead' ? <Activity className="h-6 w-6" style={{ color: '#f59e0b' }} /> :
                       <DollarSign className="h-6 w-6" style={{ color: '#10b981' }} />}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: metric.status === 'healthy' ? 'rgba(16, 185, 129, 0.1)' :
                                       metric.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                       'rgba(239, 68, 68, 0.1)',
                        color: getMetricColor(metric.status)
                      }}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                    {metric.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                      {metric.id === 'ead' || metric.id === 'ecl' ? '€' : ''}{metric.value}{metric.id === 'pd' || metric.id === 'lgd' ? '%' : metric.id === 'ead' || metric.id === 'ecl' ? 'M' : ''}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: metric.trend >= 0 ? '#ef4444' : '#10b981'
                      }}
                    >
                      {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Distribution des ratings et Evolution ECL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des ratings */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Distribution des Ratings
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="rating" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'exposure') return [`€${value}M`, 'Exposition'];
                        if (name === 'pd') return [`${value}%`, 'PD'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="exposure" fill="#6366f1" name="Exposition">
                      {ratingDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.rating.startsWith('A') ? '#10b981' :
                            entry.rating.startsWith('B') && entry.rating !== 'B' ? '#f59e0b' :
                            '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Evolution ECL */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Évolution ECL (6 mois)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pdLgdEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ecl" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="ECL (M€)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Concentration sectorielle */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Concentration Sectorielle
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorConcentration}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="exposure"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sectorConcentration.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {sectorConcentration.map((sector, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index] }}
                        />
                        <span style={{ color: '#ffffff' }}>{sector.sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm" style={{ color: '#94a3b8' }}>
                          PD: {sector.pd}% | LGD: {sector.lgd}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue PD/LGD/EAD */}
        {selectedView === 'pd-lgd' && (
          <div className="space-y-6">
            {/* Evolution PD et LGD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Évolution PD par Rating
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pdLgdEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pd" stroke="#8b5cf6" strokeWidth={2} name="PD (%)" />
                    <Line type="monotone" dataKey="lgd" stroke="#3b82f6" strokeWidth={2} name="LGD (%)" yAxisId="right" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scatter plot PD vs LGD */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Corrélation PD/LGD par Secteur
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="pd" stroke="#94a3b8" name="PD" unit="%" />
                    <YAxis dataKey="lgd" stroke="#94a3b8" name="LGD" unit="%" />
                    <ZAxis dataKey="exposure" range={[50, 400]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'pd' || name === 'lgd') return [`${value}%`, name.toUpperCase()];
                        if (name === 'exposure') return [`${value}%`, 'Exposition'];
                        return [value, name];
                      }}
                    />
                    <Scatter name="Secteurs" data={sectorConcentration} fill="#6366f1">
                      {sectorConcentration.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrice de migration simplifiée */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Matrice de Migration (12 mois)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4" style={{ color: '#94a3b8' }}>De / Vers</th>
                      {['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'].map(rating => (
                        <th key={rating} className="text-center py-2 px-2" style={{ color: '#94a3b8' }}>
                          {rating}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {migrationMatrix.map((row, index) => (
                      <tr key={index} className="border-t" style={{ borderColor: '#374151' }}>
                        <td className="py-2 px-4 font-medium" style={{ color: '#ffffff' }}>
                          {row.from}
                        </td>
                        {['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'].map(rating => {
                          const value = row[rating as keyof typeof row];
                          return (
                            <td 
                              key={rating} 
                              className="text-center py-2 px-2"
                              style={{
                                color: value === 0 ? '#64748b' : value > 50 ? '#10b981' : value > 10 ? '#f59e0b' : '#ffffff',
                                backgroundColor: value > 50 ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                              }}
                            >
                              {value || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vue Provisions IFRS 9 */}
        {selectedView === 'provisions' && (
          <div className="space-y-6">
            {/* Répartition par stage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {provisionData.map((stage, index) => (
                <div key={index} className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                      {stage.stage}
                    </h3>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>Exposition</p>
                      <p className="text-xl font-bold" style={{ color: '#ffffff' }}>
                        €{stage.amount}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>ECL</p>
                      <p className="text-xl font-bold" style={{ color: stage.color }}>
                        €{stage.ecl}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>Taux de couverture</p>
                      <p className="text-xl font-bold" style={{ color: '#ffffff' }}>
                        {stage.coverage}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphiques provisions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolution des provisions */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Évolution des Provisions ECL
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={pdLgdEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ecl" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="ECL Total (M€)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Répartition par stage (pie) */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Répartition ECL par Stage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={provisionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="ecl"
                      label={({ stage, ecl }) => `${stage}: €${ecl}M`}
                    >
                      {provisionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tableau détaillé IFRS 9 */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Détail des Provisions IFRS 9
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Total Exposition</p>
                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>€3,600M</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Total ECL</p>
                    <p className="text-lg font-bold" style={{ color: '#10b981' }}>€125.6M</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Coverage Ratio</p>
                    <p className="text-lg font-bold" style={{ color: '#ffffff' }}>3.49%</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Stage 2 Migration</p>
                    <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>+12%</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>NPL Ratio</p>
                    <p className="text-lg font-bold" style={{ color: '#ef4444' }}>2.1%</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: '#374151', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 mt-0.5" style={{ color: '#3b82f6' }} />
                    <div>
                      <h4 className="font-medium mb-1" style={{ color: '#ffffff' }}>
                        Recommandations IFRS 9
                      </h4>
                      <ul className="text-sm space-y-1" style={{ color: '#93bbfe' }}>
                        <li>• Augmenter les provisions Stage 2 suite à la dégradation du secteur Commerce</li>
                        <li>• Réviser les paramètres LGD pour les expositions non-sécurisées</li>
                        <li>• Intégrer les scénarios forward-looking actualisés dans le calcul ECL</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue Validation des Modèles */}
        {selectedView === 'validation' && (
          <div className="space-y-6">
            {/* Tableau de validation */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Validation et Backtesting des Modèles
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#374151' }}>
                      <th className="text-left py-3 px-4" style={{ color: '#94a3b8' }}>Modèle</th>
                      <th className="text-right py-3 px-4" style={{ color: '#94a3b8' }}>Prédit</th>
                      <th className="text-right py-3 px-4" style={{ color: '#94a3b8' }}>Réalisé</th>
                      <th className="text-right py-3 px-4" style={{ color: '#94a3b8' }}>Accuracy</th>
                      <th className="text-center py-3 px-4" style={{ color: '#94a3b8' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelValidation.map((model, index) => (
                      <tr key={index} className="border-b" style={{ borderColor: '#374151' }}>
                        <td className="py-3 px-4 font-medium" style={{ color: '#ffffff' }}>
                          {model.model}
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: '#94a3b8' }}>
                          {model.predicted}%
                        </td>
                        <td className="text-right py-3 px-4" style={{ color: '#94a3b8' }}>
                          {model.actual}%
                        </td>
                        <td className="text-right py-3 px-4">
                          <span 
                            className="font-medium"
                            style={{ color: model.accuracy >= 97 ? '#10b981' : model.accuracy >= 95 ? '#f59e0b' : '#ef4444' }}
                          >
                            {model.accuracy}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: model.status === 'valid' ? '#d1fae5' : '#fef3c7',
                              color: model.status === 'valid' ? '#065f46' : '#92400e'
                            }}
                          >
                            {model.status === 'valid' ? 'Validé' : 'Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Graphiques de performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accuracy radar */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Performance des Modèles
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={modelValidation}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="model" stroke="#94a3b8" fontSize={12} />
                    <PolarRadiusAxis angle={90} domain={[90, 100]} stroke="#94a3b8" />
                    <Radar 
                      name="Accuracy" 
                      dataKey="accuracy" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Tests statistiques */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                  Tests Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: '#ffffff' }}>Test de Kolmogorov-Smirnov</span>
                      <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>p-value: 0.82 (Seuil: 0.05)</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: '#ffffff' }}>Test de Hosmer-Lemeshow</span>
                      <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Chi-square: 7.23 (Seuil: 15.51)</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: '#ffffff' }}>AUC-ROC Score</span>
                      <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Score: 0.89 (Excellent)</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: '#ffffff' }}>Brier Score</span>
                      <AlertCircle className="h-5 w-5" style={{ color: '#f59e0b' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Score: 0.15 (Acceptable)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Plan d'Action Validation
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5" style={{ color: '#10b981' }} />
                    <div>
                      <h4 className="font-medium mb-1" style={{ color: '#ffffff' }}>
                        Modèles Validés
                      </h4>
                      <ul className="text-sm space-y-1" style={{ color: '#94a3b8' }}>
                        <li>• PD Corporate : Performance excellente</li>
                        <li>• LGD Secured : Calibration adéquate</li>
                        <li>• EAD CCF : Prédictions fiables</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5" style={{ color: '#f59e0b' }} />
                    <div>
                      <h4 className="font-medium mb-1" style={{ color: '#ffffff' }}>
                        Actions Requises
                      </h4>
                      <ul className="text-sm space-y-1" style={{ color: '#94a3b8' }}>
                        <li>• Recalibrer LGD Unsecured (écart 4.3%)</li>
                        <li>• Enrichir données secteur Commerce</li>
                        <li>• Revoir seuils Stage 2 migration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditRisk;