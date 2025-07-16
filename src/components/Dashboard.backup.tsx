// Fichier: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\Dashboard.tsx
// Amélioration progressive - Garde votre base existante + ajoute les fonctionnalités du cahier des charges

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Target, UserPlus, Building2, Shield, 
  AlertTriangle, Activity, BarChart3, DollarSign, Brain,
  ChevronRight, RefreshCw, Download, Info, Bell
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useFinanceStore } from '../store';

// DEBUG - GARDEZ VOS LIGNES DE DEBUG EXISTANTES
console.log('=== DEBUG STORE ===');
console.log('Store complet:', useFinanceStore.getState());
console.log('quarterlyData:', useFinanceStore.getState().quarterlyData);
console.log('==================');

const Dashboard: React.FC = () => {
  const { isDarkMode, quarterlyData, kpis, apiConnected } = useFinanceStore();
  
  // Nouveaux états pour les fonctionnalités du cahier des charges
  const [selectedSector, setSelectedSector] = useState<'all' | 'banking' | 'insurance'>('all');
  const [userProfile, setUserProfile] = useState<'banker' | 'actuary' | 'risk_manager' | 'cfo'>('banker');

  // GARDEZ VOS USEEFFECT EXISTANTS
  useEffect(() => {
    console.log('quarterlyData from store:', quarterlyData);
    console.log('quarterlyData length:', quarterlyData.length);
    if (quarterlyData.length > 0) {
      console.log('First item:', quarterlyData[0]);
    }
  }, [quarterlyData]);

  useEffect(() => {
    if (apiConnected) {
      console.log('✅ API connectée avec succès');
    }
  }, [apiConnected]);

  // GARDEZ VOS KPIDATA EXISTANTS - Ajout de quelques KPIs sectoriels
  const kpiData = [
    {
      title: "Chiffre d'affaires",
      value: "€3.24M",
      change: "+29.6% par rapport au trimestre dernier",
      icon: TrendingUp,
      color: "text-blue-500",
      positive: true,
      sector: 'all'
    },
    {
      title: "Utilisateurs actifs", 
      value: "3,540",
      change: "+3,4% cette semaine",
      icon: Users,
      color: "text-green-500",
      positive: true,
      sector: 'all'
    },
    {
      title: "Taux de conversion",
      value: "4.7%",
      change: "Stable par rapport au mois dernier",
      icon: Target,
      color: "text-yellow-500",
      positive: null,
      sector: 'all'
    },
    {
      title: "Nouveaux abonnés",
      value: "+847",
      change: "Campagne marketing en cours",
      icon: UserPlus,
      color: "text-purple-500",
      positive: true,
      sector: 'all'
    },
    // NOUVEAUX KPIs SECTORIELS selon le cahier des charges
    {
      title: "CET1 Ratio",
      value: "14.8%",
      change: "Conforme Bâle III (>10.5%)",
      icon: Building2,
      color: "text-blue-600",
      positive: true,
      sector: 'banking'
    },
    {
      title: "LCR",
      value: "125.5%",
      change: "Au-dessus du minimum (100%)",
      icon: Activity,
      color: "text-green-600",
      positive: true,
      sector: 'banking'
    },
    {
      title: "SCR Ratio",
      value: "168%",
      change: "Solvency II conforme (>100%)",
      icon: Shield,
      color: "text-purple-600",
      positive: true,
      sector: 'insurance'
    },
    {
      title: "Combined Ratio",
      value: "94.5%",
      change: "Rentable (<100%)",
      icon: BarChart3,
      color: "text-green-600",
      positive: true,
      sector: 'insurance'
    }
  ];

  // GARDEZ VOTRE quarterlyDataDisplay EXISTANT
  const quarterlyDataDisplay = quarterlyData.map((q, index) => ({
    quarter: q.quarter || `Q${index + 1} 2024`,
    Revenus: q.revenue || q.revenu || 0,
    Coûts: q.costs || q.couts || 0,
    Profit: q.profit || 0
  }));

  console.log('quarterlyData:', quarterlyData);
  console.log('quarterlyDataDisplay:', quarterlyDataDisplay);

  // GARDEZ VOTRE radarData EXISTANT
  const radarData = [
    { subject: 'Revenus', A: 100, fullMark: 100 },
    { subject: 'Coûts', A: 75, fullMark: 100 },
    { subject: 'Profit', A: 92, fullMark: 100 },
    { subject: 'Clients', A: 85, fullMark: 100 },
    { subject: 'Satisfaction', A: 88, fullMark: 100 },
  ];

  // NOUVEAUX MODULES sectoriels selon le cahier des charges
  const moduleCards = [
    {
      id: 'banking-core',
      title: 'Banking Core',
      description: 'Ratios Bâle III, LCR, NSFR, CET1',
      icon: <Building2 className="w-6 h-6" />,
      sector: 'banking',
      status: 'active',
      kpis: ['CET1: 14.8%', 'LCR: 125.5%', 'NSFR: 112.3%']
    },
    {
      id: 'insurance-core',
      title: 'Insurance Core', 
      description: 'Solvency II, SCR, MCR, ratios techniques',
      icon: <Shield className="w-6 h-6" />,
      sector: 'insurance',
      status: 'active',
      kpis: ['SCR: 168%', 'Combined: 94.5%', 'MCR: 672%']
    },
    {
      id: 'copilot-ia',
      title: 'Co-Pilot IA',
      description: 'Assistant IA Finance & Assurance',
      icon: <Brain className="w-6 h-6" />,
      sector: 'ai',
      status: 'active',
      kpis: ['Analyses: 127/j', 'Précision: 94.2%', 'Temps: 1.2s']
    }
  ];

  // Filtrer les KPIs selon le secteur sélectionné
  const filteredKPIs = selectedSector === 'all' 
    ? kpiData 
    : kpiData.filter(kpi => kpi.sector === selectedSector || kpi.sector === 'all');

  // GARDEZ VOS VARIABLES EXISTANTES
  const nplKpi = kpis.find(k => k.label === 'NPL Ratio');
  const cet1Kpi = kpis.find(k => k.label === 'CET1 Ratio');
  const lcrKpi = kpis.find(k => k.label === 'LCR');
  const roeKpi = kpis.find(k => k.label === 'ROE');

  return (
    <div className="space-y-6">
      {/* NOUVEAU HEADER avec sélecteur de secteur selon le cahier des charges */}
      <div className={`border-b pb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  PI DatAnalyz - Finance & Assurance
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Conformité Bâle III & Solvency II - Tableau de bord intelligent
                </p>
              </div>
            </div>
          </div>
          
          {/* Sélecteurs selon le cahier des charges */}
          <div className="flex items-center space-x-4">
            <select
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="banker">Banquier</option>
              <option value="actuary">Actuaire</option>
              <option value="risk_manager">Risk Manager</option>
              <option value="cfo">CFO</option>
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedSector('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSector === 'all'
                    ? 'bg-indigo-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedSector('banking')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSector === 'banking'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Banking
              </button>
              <button
                onClick={() => setSelectedSector('insurance')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSector === 'insurance'
                    ? 'bg-purple-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Insurance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GARDEZ VOS KPI CARDS EXISTANTS - Avec filtrage sectoriel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${kpi.color}`} />
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {kpi.value}
                </div>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {kpi.title}
              </h3>
              <p className={`text-sm ${
                kpi.positive === true
                  ? 'text-green-500'
                  : kpi.positive === false
                    ? 'text-red-500'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* NOUVEAUX MODULES sectoriels selon le cahier des charges */}
      {selectedSector !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCards
            .filter(module => module.sector === selectedSector || module.sector === 'ai')
            .map((module) => (
              <div key={module.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all cursor-pointer group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      module.sector === 'banking' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      module.sector === 'insurance' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-indigo-100 dark:bg-indigo-900/30'
                    }`}>
                      {module.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {module.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                
                <div className="space-y-1">
                  {module.kpis.map((kpi, index) => (
                    <div key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      • {kpi}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* GARDEZ VOS CHARTS SECTION EXISTANTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GARDEZ VOTRE Bar Chart EXISTANT */}
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analyse Trimestrielle 2024
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyDataDisplay}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="quarter" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <Tooltip contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#ffffff' : '#000000'
              }} />
              <Legend />
              <Bar dataKey="Revenus" fill="#3b82f6" name="Revenus (€)" />
              <Bar dataKey="Coûts" fill="#ef4444" name="Coûts (€)" />
              <Bar dataKey="Profit" fill="#10b981" name="Profit (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GARDEZ VOTRE Radar Chart EXISTANT */}
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance Globale
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }} />
              <Radar name="Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#ffffff' : '#000000'
              }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GARDEZ VOTRE SECTION Métriques Bancaires EXISTANTE */}
      <div className="mt-8">
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Métriques Bancaires & Réglementaires
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GARDEZ VOS MÉTRIQUES NPL, CET1, LCR, ROE EXISTANTES */}
          {nplKpi && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                NPL Ratio
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {nplKpi.value}
              </p>
            </div>
          )}
          
          {cet1Kpi && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                CET1 Ratio
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {cet1Kpi.value}
              </p>
            </div>
          )}
          
          {lcrKpi && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                LCR
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {lcrKpi.value}
              </p>
            </div>
          )}
          
          {roeKpi && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ROE
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {roeKpi.value}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;