import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';

// Imports nommés (avec accolades)
import { AnalyticsMLModule } from './components/AnalyticsMLModule';
import { BankingCore } from './components/BankingCore';
import { BankingDashboard } from './components/BankingDashboard';
import { BankingStressTest } from './components/BankingStressTest';
import { BankingCOREPExport } from './components/BankingCOREPExport';
import { CoPilotIA } from './components/CoPilotIA';
import { DataImport } from './components/DataImport';
import { Header } from './components/Header';
import { InsuranceCore } from './components/InsuranceCore';
import { InsuranceDashboard } from './components/InsuranceDashboard';
import { Settings } from './components/Settings';
import { BankingSimulation } from './components/BankingSimulation';
import { ImportIntelligentAdvanced } from './components/ImportIntelligentAdvanced';
import { InsuranceSCRDetail } from './components/InsuranceSCRDetail';
import { InsuranceRiskAnalysis } from './components/InsuranceRiskAnalysis';
import { InsuranceCombinedRatio } from './components/InsuranceCombinedRatio';
import ActuarialDashboard from './components/ActuarialDashboard';
import ActuarialProvisioning from './components/ActuarialProvisioning';
// AJOUT: Import du composant ClaimsUnderwritingDashboard
import ClaimsUnderwritingDashboard from './components/ClaimsUnderwritingDashboard';
// AJOUT: Import du composant ClaimsManagement
import ClaimsManagement from './components/ClaimsManagement';

// Imports par défaut (sans accolades)
import Analyses from './components/Analyses';
import Reports from './components/Reports';
import LiquidityALM from './components/LiquidityALM';
import MarketRisk from './components/MarketRisk';
import Predictions from './components/Predictions';
import Dashboard from './components/Dashboard';

// Nouveaux imports
import ActuarialAnalytics from './components/ActuarialAnalytics';
import ClaimsUnderwriting from './components/ClaimsUnderwriting';

// Import pour ModulesSectoriels
import ModulesSectoriels from './pages/ModulesSectoriels';

// Imports des pages
import Home from './pages/IntelligentHomepage';
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
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Route Modules Sectoriels (Analyses avancées) */}
          <Route path="/modules-sectoriels" element={<ModulesSectoriels />} />
          
          {/* Routes Banking */}
          <Route path="/banking" element={<BankingCore />} />
          <Route path="/banking/dashboard" element={<BankingDashboard />} />
          <Route path="/banking/simulation" element={<BankingSimulation />} />
          <Route path="/banking-core" element={<Navigate to="/banking" replace />} />
          
          {/* Routes des modules Banking */}
          <Route path="/banking/bale-ratios" element={<BaleRatios />} />
          <Route path="/banking/credit-risk" element={<CreditRisk />} />
          <Route path="/banking/alm-liquidity" element={<ALMLiquidity />} />
          {/* Ajout de la route Market Risk après ALMLiquidity */}
          <Route path="/market-risk" element={<MarketRisk />} />
          
          {/* Routes des ratios détaillés */}
          <Route path="/ratios/cet1" element={<CET1Page />} />
          <Route path="/ratios/lcr" element={<InsurancePlaceholder title="LCR - Liquidity Coverage Ratio" />} />
          <Route path="/ratios/npl" element={<InsurancePlaceholder title="NPL - Non-Performing Loans" />} />
          <Route path="/ratios/nsfr" element={<InsurancePlaceholder title="NSFR - Net Stable Funding Ratio" />} />
          
          {/* Routes pour les actions rapides */}
          <Route path="/reporting" element={<Reports />} />
          <Route path="/banking/stress-test" element={<BankingStressTest />} />
          <Route path="/banking/corep-export" element={<BankingCOREPExport />} />
          
          {/* Route Credit Risk */}
          <Route path="/credit-risk" element={<CreditRisk />} />
          
          {/* Routes Insurance */}
          <Route path="/insurance" element={<InsuranceCore />} />
          <Route path="/insurance-core" element={<Navigate to="/insurance" replace />} />
          <Route path="/insurance/claims" element={<ClaimsUnderwriting />} />
          <Route path="/insurance/actuarial" element={<ActuarialAnalytics />} />
          
          {/* ROUTE MODIFIÉE - Ancien placeholder remplacé par le vrai composant */}
          <Route path="/insurance/dashboard" element={<InsuranceDashboard />} />
          
          <Route path="/insurance/scr-details" element={<InsurancePlaceholder title="SCR Coverage - Détails" />} />
          <Route path="/insurance/scr-detail" element={<InsuranceSCRDetail />} />
          <Route path="/insurance/risk-analysis" element={<InsuranceRiskAnalysis />} />
          <Route path="/insurance/combined-ratio" element={<InsuranceCombinedRatio />} />
          <Route path="/insurance/loss-ratio-details" element={<InsurancePlaceholder title="Loss Ratio - Détails" />} />
          <Route path="/insurance/solvency-module" element={<InsurancePlaceholder title="Module Solvency II" />} />
          <Route path="/insurance/actuarial-analysis" element={<ActuarialAnalytics />} />
          <Route path="/insurance/claims-management" element={<ClaimsUnderwriting />} />
          
          {/* MODIFICATION CLÉ : Route mise à jour avec le nouveau chemin */}
          <Route path="/actuarial-analytics" element={<ActuarialDashboard />} />
          
          {/* AJOUT DE LA ROUTE POUR ACTUARIAL PROVISIONING */}
          <Route path="/actuarial/provisioning" element={<ActuarialProvisioning />} />
          
          {/* AJOUT DE LA NOUVELLE ROUTE POUR CLAIMS UNDERWRITING DASHBOARD */}
          <Route path="/claims-underwriting" element={<ClaimsUnderwritingDashboard />} />
          
          {/* AJOUT DE LA ROUTE POUR CLAIMS MANAGEMENT */}
          <Route path="/claims/management" element={<ClaimsManagement />} />
          
          {/* Routes Analytics & IA */}
          <Route path="/analytics" element={<Analyses />} />
          <Route path="/analytics-ml" element={<AnalyticsMLModule />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/copilot" element={<CoPilotIA />} />
          
          {/* Routes communes */}
          <Route path="/data-import" element={<DataImport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Nouvelle route pour l'import avancé */}
          <Route path="/import-advanced" element={<ImportIntelligentAdvanced />} />
          
          {/* Route 404 - Doit être la dernière */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;