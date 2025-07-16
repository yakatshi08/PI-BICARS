import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, 
  BarChart3, PieChart, Activity, FileText 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { CreditRiskEngine, CreditPortfolio, RiskMetrics, StressTestScenario } from './CreditRiskEngine';

interface CreditRiskDashboardProps {
  data?: any[];
  onClose?: () => void;
  darkMode?: boolean;
}

const CreditRiskDashboard: React.FC<CreditRiskDashboardProps> = ({ data, onClose, darkMode = false }) => {
  const [portfolio, setPortfolio] = useState<CreditPortfolio | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('Récession modérée');
  const [stressTestResults, setStressTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'stress' | 'regulatory'>('overview');

  useEffect(() => {
    // Initialiser avec des données de test si aucune donnée fournie
    const loans = data || CreditRiskEngine.generateSampleLoans(200);
    const analyzedPortfolio = CreditRiskEngine.analyzePortfolio(loans);
    const metrics = CreditRiskEngine.calculateRiskMetrics(analyzedPortfolio);
    
    setPortfolio(analyzedPortfolio);
    setRiskMetrics(metrics);
    
    // Exécuter le stress test initial
    const scenario = CreditRiskEngine.getStandardScenarios().find(s => s.name === selectedScenario);
    if (scenario) {
      const results = CreditRiskEngine.performStressTest(analyzedPortfolio, scenario);
      setStressTestResults(results);
    }
  }, [data, selectedScenario]);

  if (!portfolio || !riskMetrics) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Chargement...
      </div>
    );
  }

  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Formatage des nombres
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M€`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K€`;
    return `${num.toFixed(0)}€`;
  };

  const formatPercent = (num: number) => `${(num * 100).toFixed(2)}%`;

  // Composant pour les cartes de métriques
  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', subtext }: any) => (
    <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtext && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${
          darkMode ? `bg-${color}-900/50` : `bg-${color}-100`
        }`}>
          <Icon className={`w-6 h-6 text-${color}-${darkMode ? '400' : '600'}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-4">
          {change >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            vs mois dernier
          </span>
        </div>
      )}
    </div>
  );

  // Styles pour les tooltips des graphiques
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      borderRadius: '0.375rem',
      color: darkMode ? '#e5e7eb' : '#111827'
    },
    labelStyle: {
      color: darkMode ? '#e5e7eb' : '#111827'
    }
  };

  // Styles pour les axes des graphiques
  const axisStyle = {
    stroke: darkMode ? '#9ca3af' : '#6b7280'
  };

  // Onglet Vue d'ensemble
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Exposition totale"
          value={formatNumber(portfolio.totalExposure)}
          icon={BarChart3}
          color="blue"
          subtext={`${portfolio.loans.length} prêts`}
        />
        <MetricCard
          title="NPL Ratio"
          value={formatPercent(portfolio.nplRatio)}
          change={portfolio.nplRatio > 0.03 ? 2.5 : -1.2}
          icon={AlertTriangle}
          color={portfolio.nplRatio > 0.05 ? 'red' : 'yellow'}
        />
        <MetricCard
          title="Expected Loss"
          value={formatNumber(portfolio.expectedLoss)}
          icon={TrendingDown}
          color="orange"
          subtext={formatPercent(portfolio.expectedLoss / portfolio.totalExposure)}
        />
        <MetricCard
          title="Capital économique"
          value={formatNumber(portfolio.economicCapital)}
          icon={Shield}
          color="green"
          subtext="99.9% VaR"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par rating */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Distribution par Rating
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={Object.entries(riskMetrics.ratingDistribution).map(([rating, value]) => ({
                  name: rating,
                  value: value * portfolio.totalExposure
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(riskMetrics.ratingDistribution).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value as number)} {...tooltipStyle} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Concentration sectorielle */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Concentration Sectorielle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(riskMetrics.sectorConcentration).map(([sector, value]) => ({
              sector,
              exposure: value * portfolio.totalExposure,
              percentage: value * 100
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="sector" {...axisStyle} />
              <YAxis {...axisStyle} />
              <Tooltip 
                formatter={(value, name) => 
                  name === 'exposure' ? formatNumber(value as number) : `${(value as number).toFixed(1)}%`
                }
                {...tooltipStyle}
              />
              <Bar dataKey="percentage" fill="#3b82f6" name="% du portefeuille" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Onglet Métriques de risque
  const MetricsTab = () => (
    <div className="space-y-6">
      {/* Métriques VaR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="VaR 95%"
          value={formatNumber(riskMetrics.var95)}
          icon={Activity}
          color="blue"
          subtext="Confiance 95%"
        />
        <MetricCard
          title="VaR 99%"
          value={formatNumber(riskMetrics.var99)}
          icon={Activity}
          color="purple"
          subtext="Confiance 99%"
        />
        <MetricCard
          title="Expected Shortfall"
          value={formatNumber(riskMetrics.expectedShortfall)}
          icon={TrendingDown}
          color="red"
          subtext="CVaR 99%"
        />
      </div>

      {/* Profil de maturité */}
      <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Profil de Maturité
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(riskMetrics.maturityProfile).map(([bucket, value]) => ({
            bucket,
            exposure: value * portfolio.totalExposure,
            percentage: value * 100
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="bucket" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip 
              formatter={(value, name) => 
                name === 'exposure' ? formatNumber(value as number) : `${(value as number).toFixed(1)}%`
              }
              {...tooltipStyle}
            />
            <Bar dataKey="percentage" fill="#10b981" name="% du portefeuille" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar des risques */}
      <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Profile de Risque Multi-dimensionnel
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={[
            { subject: 'Concentration', value: riskMetrics.concentrationRisk * 100 },
            { subject: 'NPL Ratio', value: portfolio.nplRatio * 100 },
            { subject: 'PD Moyenne', value: portfolio.averagePD * 100 },
            { subject: 'Coverage Ratio', value: (portfolio.totalProvisions / portfolio.expectedLoss) * 20 },
            { subject: 'Capital Adequacy', value: (portfolio.economicCapital / portfolio.totalExposure) * 100 }
          ]}>
            <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <PolarAngleAxis dataKey="subject" {...axisStyle} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} {...axisStyle} />
            <Radar name="Profil actuel" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Onglet Stress Test
  const StressTestTab = () => (
    <div className="space-y-6">
      {/* Sélection du scénario */}
      <div className={`rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Scénario de stress test
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {CreditRiskEngine.getStandardScenarios().map(scenario => (
            <option key={scenario.name} value={scenario.name}>{scenario.name}</option>
          ))}
        </select>
      </div>

      {stressTestResults && (
        <>
          {/* Impact du stress test */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Augmentation Expected Loss"
              value={formatNumber(stressTestResults.impact.expectedLossIncrease)}
              icon={TrendingUp}
              color="red"
              subtext={`+${formatPercent(stressTestResults.impact.expectedLossIncrease / portfolio.expectedLoss)}`}
            />
            <MetricCard
              title="Capital supplémentaire"
              value={formatNumber(stressTestResults.impact.capitalRequirementIncrease)}
              icon={Shield}
              color="orange"
            />
            <MetricCard
              title="NPL Ratio stressé"
              value={formatPercent(stressTestResults.stressedCase.nplRatio)}
              icon={AlertTriangle}
              color="red"
              subtext={`+${(stressTestResults.impact.nplRatioIncrease * 100).toFixed(1)}pp`}
            />
            <MetricCard
              title="Gap de provisionnement"
              value={formatNumber(stressTestResults.impact.provisioningGap)}
              icon={FileText}
              color="yellow"
            />
          </div>

          {/* Comparaison base case vs stressed */}
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparaison Base Case vs Scénario Stressé
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                {
                  metric: 'Expected Loss',
                  'Base Case': portfolio.expectedLoss,
                  'Stressed': stressTestResults.stressedCase.expectedLoss
                },
                {
                  metric: 'Economic Capital',
                  'Base Case': portfolio.economicCapital,
                  'Stressed': stressTestResults.stressedCase.economicCapital
                },
                {
                  metric: 'Total Provisions',
                  'Base Case': portfolio.totalProvisions,
                  'Stressed': stressTestResults.stressedCase.totalProvisions
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="metric" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip formatter={(value) => formatNumber(value as number)} {...tooltipStyle} />
                <Bar dataKey="Base Case" fill="#3b82f6" />
                <Bar dataKey="Stressed" fill="#ef4444" />
                <Legend wrapperStyle={{ color: darkMode ? '#e5e7eb' : '#111827' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );

  // Onglet Réglementaire
  const RegulatoryTab = () => {
    const regulatoryRatios = CreditRiskEngine.calculateRegulatoryRatios(portfolio);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="RWA"
            value={formatNumber(regulatoryRatios.rwa)}
            icon={BarChart3}
            color="blue"
            subtext="Risk Weighted Assets"
          />
          <MetricCard
            title="Tier 1 Ratio"
            value={formatPercent(regulatoryRatios.tier1Ratio)}
            icon={Shield}
            color={regulatoryRatios.tier1Ratio >= 0.08 ? 'green' : 'red'}
            subtext={regulatoryRatios.tier1Ratio >= 0.08 ? 'Conforme' : 'Non conforme'}
          />
          <MetricCard
            title="Coverage Ratio"
            value={formatPercent(regulatoryRatios.coverageRatio)}
            icon={PieChart}
            color={regulatoryRatios.coverageRatio >= 0.5 ? 'green' : 'orange'}
          />
          <MetricCard
            title="Provisioning Ratio"
            value={formatPercent(regulatoryRatios.provisioningRatio)}
            icon={FileText}
            color="purple"
          />
        </div>

        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Conformité Réglementaire
          </h3>
          <div className="space-y-4">
            {[
              { 
                name: 'CET1 Ratio', 
                value: regulatoryRatios.tier1Ratio, 
                min: 0.045, 
                target: 0.08,
                format: formatPercent 
              },
              { 
                name: 'NPL Coverage', 
                value: regulatoryRatios.coverageRatio, 
                min: 0.4, 
                target: 0.6,
                format: formatPercent 
              },
              { 
                name: 'Provisioning', 
                value: regulatoryRatios.provisioningRatio, 
                min: 0.02, 
                target: 0.04,
                format: formatPercent 
              }
            ].map(ratio => (
              <div key={ratio.name}>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {ratio.name}
                  </span>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ratio.format(ratio.value)}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-2 rounded-full ${
                      ratio.value >= ratio.target ? 'bg-green-500' : 
                      ratio.value >= ratio.min ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (ratio.value / ratio.target) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Min: {ratio.format(ratio.min)}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Target: {ratio.format(ratio.target)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b px-6 py-4 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analyse du Risque de Crédit
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-8 mt-4">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'metrics', label: 'Métriques de risque' },
            { id: 'stress', label: 'Stress Test' },
            { id: 'regulatory', label: 'Réglementaire' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'metrics' && <MetricsTab />}
        {activeTab === 'stress' && <StressTestTab />}
        {activeTab === 'regulatory' && <RegulatoryTab />}
      </div>
    </div>
  );
};

export default CreditRiskDashboard;