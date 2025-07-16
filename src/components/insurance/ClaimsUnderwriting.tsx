import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  Search,
  Brain,
  Activity,
  Users,
  Calculator,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react';

// Composants UI simplifiés
const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-slate-700">{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-600 text-white',
    success: 'bg-emerald-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'default', className = '' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
      ${variant === 'outline' 
        ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700' 
        : 'bg-indigo-500 text-white hover:bg-indigo-600'} ${className}`}
  >
    {children}
  </button>
);

const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-700 border-slate-600',
    warning: 'bg-yellow-900/20 border-yellow-600',
    danger: 'bg-red-900/20 border-red-600',
    success: 'bg-emerald-900/20 border-emerald-600'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Types
interface Claim {
  id: string;
  date: string;
  amount: number;
  type: string;
  fraudScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
  policyholder: string;
  age: number;
  history: number;
}

interface FraudIndicator {
  factor: string;
  weight: number;
  detected: boolean;
  impact: 'high' | 'medium' | 'low';
}

interface PricingRecommendation {
  currentPremium: number;
  recommendedPremium: number;
  adjustment: number;
  confidence: number;
  factors: string[];
}

const ClaimsUnderwriting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fraud-detection');
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('analytics');

  // Données simulées pour les sinistres
  const claimsData: Claim[] = useMemo(() => [
    {
      id: 'CLM-2024-001',
      date: '2024-12-15',
      amount: 15000,
      type: 'Auto - Collision',
      fraudScore: 85,
      status: 'investigating',
      policyholder: 'Jean Dupont',
      age: 28,
      history: 2
    },
    {
      id: 'CLM-2024-002',
      date: '2024-12-14',
      amount: 3500,
      type: 'Property - Water Damage',
      fraudScore: 25,
      status: 'approved',
      policyholder: 'Marie Martin',
      age: 45,
      history: 0
    },
    {
      id: 'CLM-2024-003',
      date: '2024-12-13',
      amount: 8000,
      type: 'Auto - Theft',
      fraudScore: 92,
      status: 'rejected',
      policyholder: 'Pierre Bernard',
      age: 22,
      history: 3
    },
    {
      id: 'CLM-2024-004',
      date: '2024-12-12',
      amount: 2200,
      type: 'Health - Medical',
      fraudScore: 15,
      status: 'approved',
      policyholder: 'Sophie Leroy',
      age: 38,
      history: 1
    },
    {
      id: 'CLM-2024-005',
      date: '2024-12-11',
      amount: 45000,
      type: 'Auto - Total Loss',
      fraudScore: 78,
      status: 'pending',
      policyholder: 'Luc Moreau',
      age: 19,
      history: 1
    }
  ], [timeRange]);

  // Statistiques de fraude
  const fraudStats = useMemo(() => {
    const total = claimsData.length;
    const suspicious = claimsData.filter(c => c.fraudScore > 70).length;
    const fraudAmount = claimsData
      .filter(c => c.fraudScore > 70)
      .reduce((sum, c) => sum + c.amount, 0);
    const totalAmount = claimsData.reduce((sum, c) => sum + c.amount, 0);
    
    return {
      total,
      suspicious,
      fraudRate: (suspicious / total) * 100,
      fraudAmount,
      totalAmount,
      savedAmount: fraudAmount * 0.8 // Estimation des économies
    };
  }, [claimsData]);

  // Indicateurs de fraude pour un sinistre
  const getFraudIndicators = (claim: Claim): FraudIndicator[] => [
    {
      factor: 'Déclaration tardive',
      weight: 20,
      detected: Math.random() > 0.5,
      impact: 'high'
    },
    {
      factor: 'Historique de sinistres élevé',
      weight: 15,
      detected: claim.history > 2,
      impact: 'medium'
    },
    {
      factor: 'Âge du conducteur à risque',
      weight: 10,
      detected: claim.age < 25,
      impact: 'medium'
    },
    {
      factor: 'Montant inhabituel',
      weight: 25,
      detected: claim.amount > 20000,
      impact: 'high'
    },
    {
      factor: 'Incohérences dans la déclaration',
      weight: 30,
      detected: claim.fraudScore > 80,
      impact: 'high'
    }
  ];

  // Données pour les graphiques de fraude
  const fraudTrendData = [
    { month: 'Jan', detected: 12, prevented: 10, amount: 125000 },
    { month: 'Fév', detected: 15, prevented: 13, amount: 180000 },
    { month: 'Mar', detected: 8, prevented: 7, amount: 95000 },
    { month: 'Avr', detected: 18, prevented: 16, amount: 220000 },
    { month: 'Mai', detected: 14, prevented: 12, amount: 165000 },
    { month: 'Jun', detected: 20, prevented: 18, amount: 245000 }
  ];

  // Données pour la prédiction des coûts
  const costPredictionData = [
    { category: 'Auto', actual: 125000, predicted: 118000, variance: 5.6 },
    { category: 'Property', actual: 89000, predicted: 92000, variance: -3.3 },
    { category: 'Health', actual: 156000, predicted: 145000, variance: 7.0 },
    { category: 'Liability', actual: 78000, predicted: 81000, variance: -3.8 },
    { category: 'Life', actual: 234000, predicted: 228000, variance: 2.6 }
  ];

  // Données pour l'analyse de sélection adverse
  const adverseSelectionData = [
    { riskScore: 10, premium: 500, claims: 2 },
    { riskScore: 20, premium: 600, claims: 3 },
    { riskScore: 30, premium: 750, claims: 5 },
    { riskScore: 40, premium: 900, claims: 8 },
    { riskScore: 50, premium: 1100, claims: 12 },
    { riskScore: 60, premium: 1400, claims: 18 },
    { riskScore: 70, premium: 1800, claims: 25 },
    { riskScore: 80, premium: 2300, claims: 35 },
    { riskScore: 90, premium: 3000, claims: 48 }
  ];

  // Recommandations de pricing
  const pricingRecommendations: PricingRecommendation[] = [
    {
      currentPremium: 1200,
      recommendedPremium: 1380,
      adjustment: 15,
      confidence: 92,
      factors: ['Historique sinistres', 'Zone géographique', 'Usage véhicule']
    },
    {
      currentPremium: 800,
      recommendedPremium: 720,
      adjustment: -10,
      confidence: 88,
      factors: ['Bon conducteur', 'Véhicule sécurisé', 'Faible kilométrage']
    },
    {
      currentPremium: 2000,
      recommendedPremium: 2400,
      adjustment: 20,
      confidence: 95,
      factors: ['Jeune conducteur', 'Véhicule puissant', 'Zone urbaine']
    }
  ];

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: Claim['status']) => {
    const colors = {
      pending: 'text-yellow-500',
      approved: 'text-emerald-500',
      rejected: 'text-red-500',
      investigating: 'text-blue-500'
    };
    return colors[status];
  };

  const getFraudScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <Shield className="h-8 w-8 text-violet-500" />
            Claims & Underwriting Intelligence
          </h1>
          <p className="text-slate-400 mt-1">
            Détection de fraude, prédiction des coûts et optimisation du pricing
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">1 an</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Rapport
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Fraude Détecté</CardTitle>
            <AlertTriangle className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {fraudStats.fraudRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {fraudStats.suspicious} sinistres suspects sur {fraudStats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies Réalisées</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(fraudStats.savedAmount)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Fraudes évitées ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Précision ML</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              94.2%
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Accuracy du modèle de détection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Traitement</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              2.3h
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Temps moyen par dossier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'fraud-detection', label: 'Détection de Fraude' },
            { id: 'cost-prediction', label: 'Prédiction des Coûts' },
            { id: 'pricing-optimization', label: 'Optimisation Pricing' },
            { id: 'adverse-selection', label: 'Sélection Adverse' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'fraud-detection' && (
          <div className="space-y-4">
            {/* Liste des sinistres suspects */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sinistres à Analyser</CardTitle>
                    <CardDescription>
                      Détection automatique par Machine Learning
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'analytics' ? 'default' : 'outline'}
                      onClick={() => setViewMode('analytics')}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-white">ID</th>
                          <th className="text-left py-2 text-white">Assuré</th>
                          <th className="text-left py-2 text-white">Type</th>
                          <th className="text-right py-2 text-white">Montant</th>
                          <th className="text-center py-2 text-white">Score Fraude</th>
                          <th className="text-center py-2 text-white">Statut</th>
                          <th className="text-center py-2 text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimsData.map((claim) => (
                          <tr key={claim.id} className="border-b border-slate-700">
                            <td className="py-3 text-slate-400">{claim.id}</td>
                            <td className="py-3">
                              <div className="text-white">{claim.policyholder}</div>
                              <div className="text-xs text-slate-400">
                                {claim.age} ans • {claim.history} sinistres
                              </div>
                            </td>
                            <td className="py-3 text-slate-400">{claim.type}</td>
                            <td className="py-3 text-right text-white font-medium">
                              {formatCurrency(claim.amount)}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`font-bold ${getFraudScoreColor(claim.fraudScore)}`}>
                                {claim.fraudScore}%
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <Badge variant={
                                claim.status === 'approved' ? 'success' :
                                claim.status === 'rejected' ? 'danger' :
                                claim.status === 'investigating' ? 'info' : 'warning'
                              }>
                                {claim.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-center">
                              <Button 
                                variant="outline" 
                                className="text-xs"
                                onClick={() => setSelectedClaim(claim.id)}
                              >
                                Analyser
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Graphique de tendance */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">
                        Évolution de la Détection de Fraude
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={fraudTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis yAxisId="left" stroke="#94a3b8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#ffffff' }}
                            itemStyle={{ color: '#94a3b8' }}
                          />
                          <Legend wrapperStyle={{ color: '#ffffff' }} />
                          <Bar yAxisId="left" dataKey="detected" fill="#ef4444" name="Détectées" />
                          <Bar yAxisId="left" dataKey="prevented" fill="#10b981" name="Évitées" />
                          <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#3b82f6" 
                            name="Montant (€)"
                            strokeWidth={2}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Distribution des scores de fraude */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-white mb-3">
                          Distribution des Scores de Fraude
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart 
                            data={[
                              { range: '0-20', count: 45 },
                              { range: '20-40', count: 28 },
                              { range: '40-60', count: 15 },
                              { range: '60-80', count: 8 },
                              { range: '80-100', count: 4 }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="range" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                              labelStyle={{ color: '#ffffff' }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-white mb-3">
                          Types de Fraudes Détectées
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Fausses déclarations', value: 35, color: '#ef4444' },
                                { name: 'Gonflement montants', value: 28, color: '#f59e0b' },
                                { name: 'Sinistres fictifs', value: 22, color: '#8b5cf6' },
                                { name: 'Documents falsifiés', value: 15, color: '#3b82f6' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Fausses déclarations', value: 35, color: '#ef4444' },
                                { name: 'Gonflement montants', value: 28, color: '#f59e0b' },
                                { name: 'Sinistres fictifs', value: 22, color: '#8b5cf6' },
                                { name: 'Documents falsifiés', value: 15, color: '#3b82f6' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Détail d'analyse d'un sinistre */}
            {selectedClaim && (
              <Card>
                <CardHeader>
                  <CardTitle>Analyse Détaillée - {selectedClaim}</CardTitle>
                  <CardDescription>
                    Facteurs de risque et recommandations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Indicateurs de Fraude</h4>
                      <div className="space-y-2">
                        {getFraudIndicators(claimsData.find(c => c.id === selectedClaim)!).map((indicator, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              {indicator.detected ? (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              )}
                              <span className="text-sm text-white">{indicator.factor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                indicator.impact === 'high' ? 'danger' :
                                indicator.impact === 'medium' ? 'warning' : 'default'
                              }>
                                {indicator.weight}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-white">Recommandations IA</h4>
                      <div className="space-y-3">
                        <Alert variant="warning">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-white">Enquête approfondie recommandée</p>
                              <p className="text-sm text-slate-400 mt-1">
                                Le score de fraude élevé nécessite une vérification manuelle
                              </p>
                            </div>
                          </div>
                        </Alert>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 p-3 bg-slate-700 rounded-lg">
                            <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-white">Vérifier l'authenticité des documents</p>
                              <p className="text-xs text-slate-400">Factures et photos du sinistre</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-slate-700 rounded-lg">
                            <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-white">Contacter les témoins</p>
                              <p className="text-xs text-slate-400">Validation des circonstances</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-slate-700 rounded-lg">
                            <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-white">Analyser l'historique complet</p>
                              <p className="text-xs text-slate-400">Patterns de comportement suspect</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'cost-prediction' && (
          <div className="space-y-4">
            {/* Prédiction vs Réel */}
            <Card>
              <CardHeader>
                <CardTitle>Prédiction des Coûts par Catégorie</CardTitle>
                <CardDescription>
                  Comparaison entre prédictions ML et coûts réels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={costPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="category" stroke="#94a3b8" />
                    <YAxis tickFormatter={(value) => `${value / 1000}k€`} stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                    <Bar dataKey="actual" fill="#3b82f6" name="Coût Réel" />
                    <Bar dataKey="predicted" fill="#10b981" name="Prédiction" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Métriques de précision */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Erreur Moyenne (MAE)</span>
                      <Calculator className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">€8,542</p>
                    <p className="text-xs text-emerald-500 mt-1">-12% vs mois dernier</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">R² Score</span>
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">0.923</p>
                    <p className="text-xs text-slate-400 mt-1">Excellente précision</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Intervalle Confiance</span>
                      <Shield className="h-4 w-4 text-violet-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">95%</p>
                    <p className="text-xs text-slate-400 mt-1">±15% de la prédiction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribution des coûts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des Coûts de Sinistres</CardTitle>
                  <CardDescription>
                    Analyse par tranche de montants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { range: '0-1k', count: 320, percentage: 45 },
                        { range: '1k-5k', count: 180, percentage: 25 },
                        { range: '5k-10k', count: 120, percentage: 17 },
                        { range: '10k-25k', count: 60, percentage: 8 },
                        { range: '25k-50k', count: 25, percentage: 3.5 },
                        { range: '50k+', count: 10, percentage: 1.5 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="range" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facteurs d'Influence sur les Coûts</CardTitle>
                  <CardDescription>
                    Impact des variables sur la prédiction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { factor: 'Type de sinistre', impact: 85, trend: 'up' },
                      { factor: 'Gravité des dommages', impact: 78, trend: 'up' },
                      { factor: 'Localisation géographique', impact: 65, trend: 'stable' },
                      { factor: 'Historique assuré', impact: 52, trend: 'down' },
                      { factor: 'Délai de déclaration', impact: 38, trend: 'up' },
                      { factor: 'Saison', impact: 25, trend: 'stable' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{item.factor}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${item.impact}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12 text-right">
                            {item.impact}%
                          </span>
                          {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                          {item.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'pricing-optimization' && (
          <div className="space-y-4">
            {/* Recommandations de pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations de Pricing IA</CardTitle>
                <CardDescription>
                  Optimisation des primes basée sur le risque et la rentabilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">
                            Profil #{index + 1}
                          </h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Facteurs: {rec.factors.join(', ')}
                          </p>
                        </div>
                        <Badge variant={rec.adjustment > 0 ? 'warning' : 'success'}>
                          {rec.adjustment > 0 ? '+' : ''}{rec.adjustment}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Prime actuelle</p>
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(rec.currentPremium)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Prime recommandée</p>
                          <p className="text-lg font-semibold text-emerald-500">
                            {formatCurrency(rec.recommendedPremium)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Confiance</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-600 rounded-full h-2">
                              <div 
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${rec.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white">
                              {rec.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analyse de rentabilité */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Matrice Prix vs Risque</CardTitle>
                  <CardDescription>
                    Positionnement optimal des primes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis 
                        type="number" 
                        dataKey="risk" 
                        name="Risque" 
                        unit="%" 
                        stroke="#94a3b8"
                        domain={[0, 100]}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="premium" 
                        name="Prime" 
                        unit="€" 
                        stroke="#94a3b8"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Scatter 
                        name="Portefeuille actuel" 
                        data={[
                          { risk: 20, premium: 600, size: 100 },
                          { risk: 35, premium: 850, size: 150 },
                          { risk: 45, premium: 1100, size: 80 },
                          { risk: 60, premium: 1500, size: 120 },
                          { risk: 75, premium: 2200, size: 60 },
                          { risk: 85, premium: 3000, size: 40 }
                        ]} 
                        fill="#8b5cf6"
                      />
                      <Scatter 
                        name="Prix optimal" 
                        data={[
                          { risk: 20, premium: 650, size: 100 },
                          { risk: 35, premium: 900, size: 150 },
                          { risk: 45, premium: 1250, size: 80 },
                          { risk: 60, premium: 1700, size: 120 },
                          { risk: 75, premium: 2400, size: 60 },
                          { risk: 85, premium: 3200, size: 40 }
                        ]} 
                        fill="#10b981"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact sur la Rentabilité</CardTitle>
                  <CardDescription>
                    Simulation de l'optimisation des prix
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-700 rounded-lg">
                        <p className="text-sm text-slate-400">Chiffre d'affaires actuel</p>
                        <p className="text-xl font-bold text-white mt-1">
                          {formatCurrency(12500000)}
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-600">
                        <p className="text-sm text-emerald-400">CA optimisé</p>
                        <p className="text-xl font-bold text-emerald-500 mt-1">
                          {formatCurrency(13875000)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Augmentation CA</span>
                        <span className="text-emerald-500 font-medium">+11%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Rétention clients</span>
                        <span className="text-white font-medium">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Loss ratio estimé</span>
                        <span className="text-white font-medium">64.3%</span>
                      </div>
                    </div>

                    <Alert variant="success">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">
                            Potentiel de gain: {formatCurrency(1375000)}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            Sans augmentation significative du risque
                          </p>
                        </div>
                      </div>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'adverse-selection' && (
          <div className="space-y-4">
            {/* Analyse de sélection adverse */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse de Sélection Adverse</CardTitle>
                <CardDescription>
                  Identification des segments à risque élevé sous-tarifés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={adverseSelectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="riskScore" stroke="#94a3b8" label={{ value: 'Score de Risque', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                    <YAxis yAxisId="left" stroke="#94a3b8" label={{ value: 'Prime (€)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" label={{ value: 'Nombre de sinistres', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                    <Bar yAxisId="right" dataKey="claims" fill="#ef4444" name="Sinistres" />
                    <Line yAxisId="left" type="monotone" dataKey="premium" stroke="#3b82f6" name="Prime actuelle" strokeWidth={2} />
                    <ReferenceLine 
                      yAxisId="left" 
                      y={1500} 
                      stroke="#10b981" 
                      strokeDasharray="5 5" 
                      label={{ value: "Prime équilibre", fill: '#10b981' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Segments à risque */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Segments Problématiques</CardTitle>
                  <CardDescription>
                    Profils avec déséquilibre prime/risque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { 
                        segment: 'Jeunes conducteurs urbains',
                        loss_ratio: 125,
                        count: 1250,
                        action: 'Augmenter prime +20%'
                      },
                      {
                        segment: 'Véhicules haute valeur',
                        loss_ratio: 118,
                        count: 450,
                        action: 'Réviser franchise'
                      },
                      {
                        segment: 'Historique sinistres élevé',
                        loss_ratio: 132,
                        count: 320,
                        action: 'Exclusion ou surprime'
                      },
                      {
                        segment: 'Zone inondable',
                        loss_ratio: 145,
                        count: 280,
                        action: 'Limiter garanties'
                      }
                    ].map((segment, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">{segment.segment}</h4>
                            <p className="text-xs text-slate-400">{segment.count} polices</p>
                          </div>
                          <Badge variant="danger">
                            LR: {segment.loss_ratio}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-500">{segment.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stratégies Anti-Sélection</CardTitle>
                  <CardDescription>
                    Actions recommandées pour équilibrer le portefeuille
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Scoring prédictif amélioré</h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Intégrer 15 nouvelles variables comportementales
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs text-emerald-500">Impact attendu:</div>
                            <Badge variant="success">-8% loss ratio</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <Shield className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Segmentation dynamique</h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Ajustement temps réel des primes selon profil
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs text-emerald-500">Impact attendu:</div>
                            <Badge variant="success">+12% rentabilité</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Programme fidélité</h4>
                          <p className="text-sm text-slate-400 mt-1">
                            Récompenser les bons profils pour les retenir
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs text-emerald-500">Impact attendu:</div>
                            <Badge variant="success">+15% rétention</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Radar des risques */}
            <Card>
              <CardHeader>
                <CardTitle>Profil de Risque du Portefeuille</CardTitle>
                <CardDescription>
                  Comparaison avec les benchmarks du marché
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={[
                    { axis: 'Fréquence sinistres', portfolio: 75, market: 65, optimal: 55 },
                    { axis: 'Coût moyen', portfolio: 82, market: 70, optimal: 60 },
                    { axis: 'Fraude', portfolio: 45, market: 50, optimal: 30 },
                    { axis: 'Satisfaction client', portfolio: 70, market: 75, optimal: 85 },
                    { axis: 'Rentabilité', portfolio: 60, market: 70, optimal: 80 },
                    { axis: 'Croissance', portfolio: 85, market: 65, optimal: 75 }
                  ]}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="axis" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Notre portefeuille" dataKey="portfolio" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Marché" dataKey="market" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Radar name="Optimal" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsUnderwriting;