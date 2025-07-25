import React, { useState } from 'react';
import {
  AlertTriangle, Shield, TrendingUp, Activity,
  BarChart3, PieChart, ArrowLeft, Info,
  AlertCircle, CheckCircle, ChevronRight,
  Zap, Target, Eye, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface Risk {
  id: string;
  name: string;
  category: string;
  impact: 'Faible' | 'Moyen' | 'Élevé' | 'Critique';
  probability: 'Rare' | 'Possible' | 'Probable' | 'Très probable';
  score: number;
  trend: 'up' | 'down' | 'stable';
  mitigation: string;
}

export const InsuranceRiskAnalysis: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Matrice des risques
  const risks: Risk[] = [
    {
      id: 'R001',
      name: 'Catastrophes naturelles majeures',
      category: 'Souscription',
      impact: 'Critique',
      probability: 'Possible',
      score: 16,
      trend: 'up',
      mitigation: 'Réassurance renforcée, diversification géographique'
    },
    {
      id: 'R002',
      name: 'Volatilité des marchés financiers',
      category: 'Marché',
      impact: 'Élevé',
      probability: 'Probable',
      score: 12,
      trend: 'up',
      mitigation: 'Couvertures dérivées, allocation défensive'
    },
    {
      id: 'R003',
      name: 'Cyber-attaques sur SI',
      category: 'Opérationnel',
      impact: 'Élevé',
      probability: 'Possible',
      score: 9,
      trend: 'up',
      mitigation: 'SOC 24/7, tests intrusion, plan continuité'
    },
    {
      id: 'R004',
      name: 'Défaut contrepartie réassurance',
      category: 'Crédit',
      impact: 'Élevé',
      probability: 'Rare',
      score: 6,
      trend: 'stable',
      mitigation: 'Diversification réassureurs, collatéral'
    },
    {
      id: 'R005',
      name: 'Non-conformité réglementaire',
      category: 'Conformité',
      impact: 'Moyen',
      probability: 'Possible',
      score: 6,
      trend: 'down',
      mitigation: 'Veille réglementaire, audits réguliers'
    },
    {
      id: 'R006',
      name: 'Hausse sinistralité automobile',
      category: 'Souscription',
      impact: 'Moyen',
      probability: 'Probable',
      score: 9,
      trend: 'stable',
      mitigation: 'Tarification dynamique, prévention'
    }
  ];

  // Données pour le radar chart
  const radarData = [
    { category: 'Marché', current: 75, target: 60, max: 100 },
    { category: 'Souscription', current: 82, target: 70, max: 100 },
    { category: 'Crédit', current: 45, target: 50, max: 100 },
    { category: 'Opérationnel', current: 68, target: 60, max: 100 },
    { category: 'Conformité', current: 35, target: 40, max: 100 }
  ];

  // Évolution du score de risque global
  const riskEvolution = [
    { month: 'Juil', score: 245, seuil: 300 },
    { month: 'Août', score: 252, seuil: 300 },
    { month: 'Sept', score: 248, seuil: 300 },
    { month: 'Oct', score: 255, seuil: 300 },
    { month: 'Nov', score: 251, seuil: 300 },
    { month: 'Déc', score: 242, seuil: 300 }
  ];

  // Répartition par catégorie
  const categoryDistribution = [
    { name: 'Souscription', value: 35, color: '#8b5cf6' },
    { name: 'Marché', value: 30, color: '#3b82f6' },
    { name: 'Opérationnel', value: 20, color: '#10b981' },
    { name: 'Crédit', value: 10, color: '#f59e0b' },
    { name: 'Conformité', value: 5, color: '#ef4444' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Faible': return 'text-green-500';
      case 'Moyen': return 'text-yellow-500';
      case 'Élevé': return 'text-orange-500';
      case 'Critique': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 4) return 'bg-green-500';
    if (score <= 9) return 'bg-yellow-500';
    if (score <= 12) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredRisks = selectedCategory === 'all' 
    ? risks 
    : risks.filter(r => r.category === selectedCategory);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/insurance/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyse des Risques Assurance
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cartographie et suivi des risques majeurs
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="h-5 w-5" />
            Exporter Analyse
          </button>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-sm font-medium text-red-500">+2</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Risques Critiques
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              1
            </p>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-orange-500" />
              <span className="text-sm font-medium text-green-500">-1</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Risques Élevés
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              3
            </p>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Score Global
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              242/300
            </p>
          </div>

          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-green-500" />
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Couverture
            </p>
            <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              89%
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar des risques */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Profil de Risque par Catégorie
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <PolarAngleAxis dataKey="category" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Radar name="Actuel" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Cible" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Évolution du score de risque */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution du Score de Risque Global
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis domain={[200, 320]} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} name="Score" />
                <Line type="monotone" dataKey="seuil" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Seuil critique" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrice des risques */}
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Registre des Risques Majeurs
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <option value="all">Toutes catégories</option>
              <option value="Souscription">Souscription</option>
              <option value="Marché">Marché</option>
              <option value="Opérationnel">Opérationnel</option>
              <option value="Crédit">Crédit</option>
              <option value="Conformité">Conformité</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Risque</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Catégorie</th>
                  <th className={`px-4 py-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Impact</th>
                  <th className={`px-4 py-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Probabilité</th>
                  <th className={`px-4 py-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Score</th>
                  <th className={`px-4 py-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tendance</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{risk.id}</td>
                    <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{risk.name}</td>
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {risk.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </td>
                    <td className={`px-4 py-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {risk.probability}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-12 h-6 rounded-full ${getScoreColor(risk.score)}`}>
                        <span className="text-white text-sm font-bold">{risk.score}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {risk.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500 inline" />}
                      {risk.trend === 'down' && <TrendingUp className="h-4 w-4 text-green-500 inline transform rotate-180" />}
                      {risk.trend === 'stable' && <span className="text-gray-500">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {risk.mitigation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Répartition par catégorie */}
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Répartition des Risques par Catégorie
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            
            <div className="col-span-2 space-y-3">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cat.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};