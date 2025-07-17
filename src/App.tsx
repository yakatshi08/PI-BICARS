<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from './store'; // Ajouté pour InsurancePlaceholder

// Imports nommés (avec accolades)
import { AnalyticsMLModule } from './components/AnalyticsMLModule';
=======
// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Imports nommés (avec accolades)
import { AnalyticsMLModule } from './components/AnalyticsMLModule';
import { BankingCore } from './components/BankingCore';
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
import { CoPilotIA } from './components/CoPilotIA';
import { Dashboard } from './components/Dashboard';
import { DataImport } from './components/DataImport';
import { Header } from './components/Header';
import { InsuranceCore } from './components/InsuranceCore';

// Imports default (sans accolades)
import Analyses from './components/Analyses';
import CreditRisk from './components/CreditRisk';
import LiquidityALM from './components/LiquidityALM';
import MarketRisk from './components/MarketRisk';
import Parameters from './components/Parameters';
import Predictions from './components/Predictions';
import Reports from './components/Reports';

// ✅ AJOUT des nouveaux imports :
import ActuarialAnalytics from './components/ActuarialAnalytics';
import ClaimsUnderwriting from './components/ClaimsUnderwriting';

<<<<<<< HEAD
// ✅ CORRECTION : Nouvel import pour BankingDashboard
import BankingDashboard from './pages/banking/BankingDashboard';

// Composant temporaire pour les pages manquantes
const InsurancePlaceholder = ({ title }: { title: string }) => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
      <button
        onClick={() => navigate(-1)}
        className={`px-4 py-2 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
      >
        ← Retour
      </button>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
      <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Page en cours de développement
      </p>
    </div>
  );
};

=======
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header fixe en haut */}
        <Header />
        
        {/* Contenu principal */}
        <main className="flex-1 w-full">
          <Routes>
            {/* Route par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
<<<<<<< HEAD
            {/* ✅ CORRECTION : Routes Banking */}
            <Route path="/banking" element={<BankingDashboard />} />
            <Route path="/banking/risk-analysis" element={<BankingDashboard />} />
            
            {/* Routes Banking supplémentaires */}
            <Route path="/banking/credit-risk" element={<CreditRisk />} />
            <Route path="/banking/liquidity-alm" element={<LiquidityALM />} />
            <Route path="/banking/market-risk" element={<MarketRisk />} />
=======
            {/* Routes Banking */}
            <Route path="/banking" element={<BankingCore />} />
            <Route path="/banking/credit-risk" element={<CreditRisk />} />
            <Route path="/banking/liquidity-alm" element={<LiquidityALM />} />
            <Route path="/banking/market-risk" element={<MarketRisk />} />
            <Route path="/banking/risk-analysis" element={<BankingCore />} />
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
            
            {/* Routes Insurance */}
            <Route path="/insurance" element={<InsuranceCore />} />
            <Route path="/insurance/claims" element={<ClaimsUnderwriting />} />
            <Route path="/insurance/actuarial" element={<ActuarialAnalytics />} />
            
<<<<<<< HEAD
            {/* ✅ AJOUT : Routes Insurance détaillées */}
            <Route path="/insurance/scr-details" element={<InsurancePlaceholder title="SCR Coverage - Détails" />} />
            <Route path="/insurance/combined-ratio" element={<InsurancePlaceholder title="Combined Ratio - Analyse" />} />
            <Route path="/insurance/loss-ratio-details" element={<InsurancePlaceholder title="Loss Ratio - Détails" />} />
            <Route path="/insurance/solvency-module" element={<InsurancePlaceholder title="Module Solvency II" />} />
            <Route path="/insurance/actuarial-analysis" element={<ActuarialAnalytics />} />
            <Route path="/insurance/claims-management" element={<ClaimsUnderwriting />} />
            
=======
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
            {/* Routes Analytics & IA */}
            <Route path="/analytics" element={<Analyses />} />
            <Route path="/analytics-ml" element={<AnalyticsMLModule />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/copilot" element={<CoPilotIA />} />
            
            {/* Routes Data & Reports */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/data-import" element={<DataImport />} />
            <Route path="/parameters" element={<Parameters />} />
            
            {/* Route 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
