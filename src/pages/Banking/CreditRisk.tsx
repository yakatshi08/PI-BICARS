import React, { useState } from 'react';
import { Shield, TrendingUp, Calculator, FileText, AlertCircle, BarChart3, Activity } from 'lucide-react';

// Types
interface LoanData {
  id: string;
  borrower: string;
  amount: number;
  pd: number;
  lgd: number;
  ead: number;
  ecl: number;
  stage: number;
  rating: string;
  sector: string;
}

interface ECLCalculation {
  pd: number;
  lgd: number;
  ead: number;
  stage: number;
}

const CreditRisk: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
  const [showECLModal, setShowECLModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    pd: '',
    lgd: '',
    rating: '',
    sector: ''
  });

  // Données mockées pour les prêts
  const loansData: LoanData[] = [
    { id: 'L001', borrower: 'ABC Corp', amount: 5000000, pd: 0.02, lgd: 0.45, ead: 5000000, ecl: 45000, stage: 1, rating: 'BBB', sector: 'Manufacturing' },
    { id: 'L002', borrower: 'XYZ Ltd', amount: 3000000, pd: 0.05, lgd: 0.40, ead: 3000000, ecl: 60000, stage: 2, rating: 'BB', sector: 'Retail' },
    { id: 'L003', borrower: 'Tech Solutions', amount: 8000000, pd: 0.01, lgd: 0.35, ead: 8000000, ecl: 28000, stage: 1, rating: 'A', sector: 'Technology' },
    { id: 'L004', borrower: 'Global Trade', amount: 2000000, pd: 0.08, lgd: 0.50, ead: 2000000, ecl: 80000, stage: 2, rating: 'B', sector: 'Trading' },
  ];

  const calculateECL = () => {
    const pd = parseFloat(formData.pd) / 100;
    const lgd = parseFloat(formData.lgd) / 100;
    const ead = parseFloat(formData.amount);
    const ecl = pd * lgd * ead;
    return ecl;
  };

  const getStageColor = (stage: number) => {
    switch(stage) {
      case 1: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500';
      case 2: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 3: return 'text-red-500 bg-red-500/10 border-red-500';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400';
    }
  };

  const getRatingColor = (rating: string) => {
    if (rating.startsWith('A')) return 'text-emerald-500';
    if (rating.startsWith('B')) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-violet-500" size={32} />
            <h1 className="text-3xl font-bold text-white">
              Credit Risk Analytics - IFRS 9
            </h1>
          </div>
          <p className="text-slate-400">
            Évaluation avancée du risque de crédit et calcul des provisions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-6 space-x-6">
          <button
            onClick={() => setActiveTab('individual')}
            className={\pb-3 font-medium transition-all border-b-2 \\}
          >
            Analyse Individuelle
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={\pb-3 font-medium transition-all border-b-2 \\}
          >
            Portefeuille
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={\pb-3 font-medium transition-all border-b-2 \\}
          >
            Stress Testing
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Formulaire ECL Calculator */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Calculator className="text-blue-500" size={24} />
                Calculateur ECL
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Montant d'exposition (€)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                    placeholder="1000000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      PD (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pd}
                      onChange={(e) => setFormData({...formData, pd: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      placeholder="2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      LGD (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lgd}
                      onChange={(e) => setFormData({...formData, lgd: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      placeholder="45"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Rating
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="AAA">AAA</option>
                      <option value="AA">AA</option>
                      <option value="A">A</option>
                      <option value="BBB">BBB</option>
                      <option value="BB">BB</option>
                      <option value="B">B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Secteur
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="tech">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowECLModal(true)}
                  className="w-full py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator size={20} />
                  Calculer ECL
                </button>

                {formData.amount && formData.pd && formData.lgd && (
                  <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                    <p className="text-slate-400 text-sm">ECL Estimé</p>
                    <p className="text-2xl font-bold text-white">
                      €{calculateECL().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Résultats et KPIs */}
            <div className="xl:col-span-2 space-y-6">
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">PD Moyen</p>
                    <TrendingUp className="text-emerald-500" size={16} />
                  </div>
                  <p className="text-2xl font-bold text-white">3.2%</p>
                  <p className="text-emerald-500 text-xs mt-1">↓ -0.5%</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">LGD Moyen</p>
                    <BarChart3 className="text-blue-500" size={16} />
                  </div>
                  <p className="text-2xl font-bold text-white">42.5%</p>
                  <p className="text-slate-400 text-xs mt-1">Stable</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">EAD Total</p>
                    <Activity className="text-violet-500" size={16} />
                  </div>
                  <p className="text-2xl font-bold text-white">€18M</p>
                  <p className="text-emerald-500 text-xs mt-1">↑ +12%</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">ECL Total</p>
                    <AlertCircle className="text-red-500" size={16} />
                  </div>
                  <p className="text-2xl font-bold text-white">€213K</p>
                  <p className="text-red-500 text-xs mt-1">↑ +8.4%</p>
                </div>
              </div>

              {/* Stage Distribution */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Distribution par Stage IFRS 9
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg border-2 border-emerald-500 bg-emerald-500/10">
                    <h4 className="text-3xl font-bold text-emerald-500">75%</h4>
                    <p className="text-white font-medium">Stage 1</p>
                    <p className="text-slate-400 text-sm">Performing</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border-2 border-yellow-500 bg-yellow-500/10">
                    <h4 className="text-3xl font-bold text-yellow-500">20%</h4>
                    <p className="text-white font-medium">Stage 2</p>
                    <p className="text-slate-400 text-sm">Underperforming</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border-2 border-red-500 bg-red-500/10">
                    <h4 className="text-3xl font-bold text-red-500">5%</h4>
                    <p className="text-white font-medium">Stage 3</p>
                    <p className="text-slate-400 text-sm">Non-performing</p>
                  </div>
                </div>
              </div>

              {/* Loans Table */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Expositions Récentes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Emprunteur</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Montant</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium">Rating</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium">Stage</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">ECL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loansData.map((loan) => (
                        <tr key={loan.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 text-white">{loan.id}</td>
                          <td className="py-3 px-4 text-white">{loan.borrower}</td>
                          <td className="py-3 px-4 text-white text-right">
                            €{(loan.amount / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={\ont-medium \\}>
                              {loan.rating}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={\px-3 py-1 rounded-full text-xs font-medium border \\}>
                              Stage {loan.stage}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white text-right">
                            €{(loan.ecl / 1000).toFixed(0)}K
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Analyse du Portefeuille</h2>
            <p className="text-slate-400">Visualisation et analyse du portefeuille de crédit...</p>
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Stress Testing</h2>
            <p className="text-slate-400">Scénarios de stress et analyse d'impact...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditRisk;
