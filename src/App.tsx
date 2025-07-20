import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';

// Imports nommés (avec accolades)
import { AnalyticsMLModule } from './components/AnalyticsMLModule';
import { BankingCore } from './components/BankingCore';
import { CoPilotIA } from './components/CoPilotIA';
import { Dashboard } from './components/Dashboard';
import { DataImport } from './components/DataImport';
import { Header } from './components/Header';
import { InsuranceCore } from './components/InsuranceCore';
import { Settings } from './components/Settings';

// Imports par défaut (sans accolades)
import Analyses from './components/Analyses';
import Reports from './components/Reports';
import CreditRiskComponent from './components/CreditRisk'; // Renommé pour éviter conflit
import LiquidityALM from './components/LiquidityALM';
import MarketRisk from './components/MarketRisk';
import Predictions from './components/Predictions';

// Nouveaux imports
import ActuarialAnalytics from './components/ActuarialAnalytics';
import ClaimsUnderwriting from './components/ClaimsUnderwriting';
import BankingDashboard from './pages/banking/BankingDashboard';

// Import pour ModulesSectoriels
import ModulesSectoriels from './pages/ModulesSectoriels';

// Nouveaux imports des pages (ajoutés selon consigne)
import Home from './pages/IntelligentHomepage'; // Modifié ici
import BaleRatios from './pages/BaleRatios';
import CreditRisk from './pages/CreditRisk';
import ALMLiquidity from './pages/ALMLiquidity';
import CET1Page from './pages/ratios/CET1Page';

// Composant temporaire pour les pages manquantes
const InsurancePlaceholder = ({ title }: { title: string }) => {
  const { darkMode } = useStore();
  
  return (
    <div className={`p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Cette page est en cours de développement.
      </p>
    </div>
  );
};

// Layout simplifié - SANS Sidebar
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header fixe en haut */}
      <Header />
      
      {/* Contenu principal - TOUJOURS en pleine largeur */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Page d'accueil - AJOUT SELON CONSIGNE */}
          <Route path="/" element={<Home />} />
          
          {/* Route par défaut modifiée */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Route Modules Sectoriels (Analyses avancées) */}
          <Route path="/modules-sectoriels" element={<ModulesSectoriels />} />
          
          {/* Routes Banking */}
          <Route path="/banking" element={<BankingDashboard />} />
          <Route path="/banking/risk-analysis" element={<BankingDashboard />} />
          <Route path="/banking/credit-risk" element={<CreditRiskComponent />} />
          <Route path="/banking/liquidity-alm" element={<LiquidityALM />} />
          <Route path="/banking/market-risk" element={<MarketRisk />} />
          
          {/* Ajout des nouvelles routes Banking détaillées - SELON CONSIGNE */}
          <Route path="/bale-ratios" element={<BaleRatios />} />
          <Route path="/credit-risk" element={<CreditRisk />} />
          <Route path="/alm-liquidity" element={<ALMLiquidity />} />
          <Route path="/ratios/cet1" element={<CET1Page />} />
          
          {/* Routes existantes pour les autres ratios */}
          <Route path="/ratios/lcr" element={<InsurancePlaceholder title="LCR - Liquidity Coverage Ratio" />} />
          <Route path="/ratios/npl" element={<InsurancePlaceholder title="NPL Ratio - Non-Performing Loans" />} />
          <Route path="/corep-report" element={<InsurancePlaceholder title="Rapport COREP" />} />
          <Route path="/stress-test" element={<InsurancePlaceholder title="Stress Test" />} />
          
          {/* Routes Insurance */}
          <Route path="/insurance" element={<InsuranceCore />} />
          <Route path="/insurance/claims" element={<ClaimsUnderwriting />} />
          <Route path="/insurance/actuarial" element={<ActuarialAnalytics />} />
          <Route path="/insurance/scr-details" element={<InsurancePlaceholder title="SCR Coverage - Détails" />} />
          <Route path="/insurance/combined-ratio" element={<InsurancePlaceholder title="Combined Ratio - Analyse" />} />
          <Route path="/insurance/loss-ratio-details" element={<InsurancePlaceholder title="Loss Ratio - Détails" />} />
          <Route path="/insurance/solvency-module" element={<InsurancePlaceholder title="Module Solvency II" />} />
          <Route path="/insurance/actuarial-analysis" element={<ActuarialAnalytics />} />
          <Route path="/insurance/claims-management" element={<ClaimsUnderwriting />} />
          
          {/* Routes Analytics & IA */}
          <Route path="/analytics" element={<Analyses />} />
          <Route path="/analytics-ml" element={<AnalyticsMLModule />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/copilot" element={<CoPilotIA />} />
          
          {/* Routes communes */}
          <Route path="/data-import" element={<DataImport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;