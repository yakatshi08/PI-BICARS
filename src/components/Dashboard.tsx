// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\Dashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Target, UserPlus,
  DollarSign, Percent, Activity, Shield,
  AlertCircle, CheckCircle, TrendingDown, Settings,
  CreditCard, Building2, Droplets, FileText, Calculator, Upload, Brain
} from 'lucide-react';
import { useStore } from '../store';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import { CreditRiskDashboard } from '../modules/banking/credit-risk';
import { useNavigate } from 'react-router-dom';

// Types pour les KPIs
interface KPI {
  id: string;
  name: string;
  value: string;
  change?: string;
  status?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  sector?: 'banking' | 'insurance' | 'all';
  description?: string;
  threshold?: string;
}

const ModuleCards = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore();

  const modules = [
    {
      title: "🤖 Co-Pilot IA",
      subtitle: "Votre assistant intelligent Finance & Assurance",
      path: "/copilot",
      icon: Brain,
      color: "from-pink-500 to-purple-600",
      stats: { label: "Commandes", value: "∞" },
      category: "featured",
      featured: true
    },
    {
      title: "Credit Risk Management",
      subtitle: "Analyse PD, LGD, EAD et calcul des provisions ECL",
      path: "/banking/credit-risk",
      icon: CreditCard,
      color: "from-blue-500 to-blue-600",
      stats: { label: "NPL Ratio", value: "3.2%" }
    },
    {
      title: "Insurance Core Module",
      subtitle: "Solvency II, métriques techniques et gestion des risques",
      path: "/insurance",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      stats: { label: "SCR Coverage", value: "185%" }
    },
    {
      title: "Banking Core",
      subtitle: "Métriques prudentielles et ratios bancaires",
      path: "/banking",
      icon: Building2,
      color: "from-indigo-500 to-indigo-600",
      stats: { label: "CET1 Ratio", value: "14.8%" }
    },
    {
      title: "Liquidity & ALM",
      subtitle: "Gestion de la liquidité et ALM analytics",
      path: "/banking/liquidity-alm",
      icon: Droplets,
      color: "from-cyan-500 to-cyan-600",
      stats: { label: "LCR", value: "125.5%" }
    },
    {
      title: "Market Risk",
      subtitle: "VaR, CVaR et stress tests marché",
      path: "/banking/market-risk",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      stats: { label: "VaR 99%", value: "€2.3M" }
    },
    {
      title: "Reports & Analytics",
      subtitle: "Rapports réglementaires COREP, FINREP, QRT",
      path: "/reports",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      stats: { label: "Rapports", value: "12" }
    }
  ];

  return (
    <div className="mt-8">
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Modules Sectoriels
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.path}
              onClick={() => navigate(module.path)}
              className={`relative overflow-hidden rounded-xl p-6 cursor-pointer
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {module.stats.label}
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {module.stats.value}
                    </p>
                  </div>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {module.title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {module.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GlobalQuickActions = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore();

  return (
    <div className={`mt-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Actions Rapides Globales
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/reports?type=corep')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FileText className="h-5 w-5 mb-1 mx-auto" />
          <span className="text-sm font-medium">Générer COREP</span>
        </button>
        <button
          onClick={() => navigate('/reports?type=qrt')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Shield className="h-5 w-5 mb-1 mx-auto" />
          <span className="text-sm font-medium">Générer QRT</span>
        </button>
        <button
          onClick={() => navigate('/banking/credit-risk')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Calculator className="h-5 w-5 mb-1 mx-auto" />
          <span className="text-sm font-medium">Calculer ECL</span>
        </button>
        <button
          onClick={() => navigate('/data-import')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Upload className="h-5 w-5 mb-1 mx-auto" />
          <span className="text-sm font-medium">Import Données</span>
        </button>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { darkMode } = useStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section des modules sectoriels */}
        <ModuleCards />

        {/* Section des actions rapides */}
        <GlobalQuickActions />
      </div>
    </div>
  );
};
