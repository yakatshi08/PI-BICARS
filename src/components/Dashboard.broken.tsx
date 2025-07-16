// Fichier: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\Dashboard.tsx
// Version corrigée avec interface propre et dynamique

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
  
  // États pour les fonctionnalités du cahier des charges
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

  // KPIs avec secteurs - Version corrigée
  const kpiData = [
    {
      title: "Chiffre d'affaires",
      value: "€3.24M",
      change: "+29.6% par rapport au trimestre dernier",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      positive: true,
      sector: 'all'
    },
    {
      title: "Utilisateurs actifs", 
      value: "3,540",
      change: "+3,4% cette semaine",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      positive: true,
      sector: 'all'
    },
    {
      title: "Taux de conversion",
      value: "4.7%",
      change: "Stable par rapport au mois dernier",
      icon: Target,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      positive: null,
      sector: 'all'
    },
    {
      title: "Nouveaux abonnés",
      value: "+847",
      change: "Campagne marketing en cours",
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      positive: true,
      sector: 'all'
    },
    // KPIs SECTORIELS Banking
    {
      title: "CET1 Ratio",
      value: "14.8%",
      change: "Conforme Bâle III (>10.5%)",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      positive: true,
      sector: 'banking'
    },
    {
      title: "LCR",
      value: "125.5%",
      change: "Au-dessus du minimum (100%)",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      positive: true,
      sector: 'banking'
    },
    // KPIs SECTORIELS Insurance
    {
      title: "SCR Ratio",
      value: "168%",
      change: "Solvency II conforme (>100%)",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      positive: true,
      sector: 'insurance'
    },
    {
      title: "Combined Ratio",
      value: "94.5%",
      change: "Rentable (<100%)",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
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

  // MODULES sectoriels
  const moduleCards = [
    {
      id: 'banking-core',
      title: 'Banking Core',
      description: 'Ratios Bâle III, LCR, NSFR, CET1',
      icon: <Building2 className="w-6 h-6" />,
      sector: 'banking',
      status: 'active',
      kpis: ['CET1: 14.8%', 'LCR: 125.5%', 'NSFR: 112.3%'],
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600'
    },
    {
      id: 'insurance-core',
      title: 'Insurance Core', 
      description: 'Solvency II, SCR, MCR, ratios techniques',
      icon: <Shield className="w-6 h-6" />,
      sector: 'insurance',
      status: 'active',
      kpis: ['SCR: 168%', 'Combined: 94.5%', 'MCR: 672%'],
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600'
    },
    {
      id: 'copilot-ia',
      title: 'Co-Pilot IA',
      description: 'Assistant IA Finance & Assurance',
      icon: <Brain className="w-6 h-6" />,
      sector: 'ai',
      status: 'active',
      kpis: ['Analyses: 127/j', 'Précision: 94.2%', 'Temps: 1.2s'],
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600'
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
    <div className={`min-h-screen p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* HEADER CORRIGÉ avec navigation propre */}
      <div className={`mb-8 p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        {/* Titre principal */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                PI DatAnalyz - Finance & Assurance
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Conformité Bâle III & Solvency II - Tableau de bord intelligent
              </p>
            </div>
          </div>
          
          {/* Indicateur de connexion API */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {apiConnected ? 'API Connectée' : 'API Déconnectée'}
            </span>
          </div>
        </div>

        {/* Navigation secteur - VERSION CORRIGÉE */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Sélecteur de profil */}
          <div className="flex items-center space-x-3">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Profil :
            </label>
            <select
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
              }`}
            >
              <option value="banker">🏦 Banquier</option>
              <option value="actuary">📊 Actuaire</option>
              <option value="risk_manager">⚠️ Risk Manager</option>
              <option value="cfo">💼 CFO</option>
            </select>
          </div>
          
          {/* Boutons secteur - VERSION CORRIGÉE */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mr-2`}>
              Secteur :
            </span>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setSelectedSector('all')}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  selectedSector === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedSector('banking')}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  selectedSector === 'banking'
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Banking
              </button>
              <button
                onClick={() => setSelectedSector('insurance')}
                className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  selectedSector === 'insurance'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Insurance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS - VERSION CORRIGÉE avec grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {filteredKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`relative p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Header avec icône et valeur */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {kpi.value}
                </div>
              </div>
              
              {/* Titre */}
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {kpi.title}
              </h3>
              
              {/* Changement avec couleur dynamique */}
              <p className={`text-sm ${
                kpi.positive === true
                  ? 'text-green-500'
                  : kpi.positive === false
                    ? 'text-red-500'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {kpi.change}
              </p>

              {/* Badge secteur */}
              {kpi.sector !== 'all' && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                  kpi.sector === 'banking' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  kpi.sector === 'insurance' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {kpi.sector}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODULES sectoriels - VERSION CORRIGÉE */}
      {selectedSector !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {moduleCards
            .filter(module => module.sector === selectedSector || module.sector === 'ai')
            .map((module) => (
              <div 
                key={module.id} 
                className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <div className={module.iconColor}>
                        {module.icon}
                      </div>
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
                
                <div className="space-y-2">
                  {module.kpis.map((kpi, index) => (
                    <div key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      {kpi}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* CHARTS SECTION - VERSION CORRIGÉE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Analyse Trimestrielle 2024
            </h3>
            <button className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <Download className="w-4 h-4" />
            </button>
          </div>
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

        {/* Radar Chart */}
        <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Globale
            </h3>
            <button className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
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

      {/* MÉTRIQUES BANCAIRES EXISTANTES - VERSION CORRIGÉE */}
      <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Métriques Bancaires & Réglementaires
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NPL Ratio */}
          {nplKpi && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                NPL Ratio
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {nplKpi.value}
              </p>
            </div>
          )}
          
          {/* CET1 Ratio */}
          {cet1Kpi && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                CET1 Ratio
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {cet1Kpi.value}
              </p>
            </div>
          )}
          
          {/* LCR */}
          {lcrKpi && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                LCR
              </h4>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {lcrKpi.value}
              </p>
            </div>
          )}
          
          {/* ROE */}
          {roeKpi && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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