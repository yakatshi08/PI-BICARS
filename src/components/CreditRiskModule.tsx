import React, { useState } from 'react';
import { AlertTriangle, Calculator, FileText, Shield, Upload, TrendingUp, BarChart, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CreditRiskModule: React.FC = () => {
  const [exposure, setExposure] = useState({
    amount: '',
    type: '',
    rating: '',
    tenor: '',
    lgd: '',
    collateral: '',
    sector: ''
  });

  const [results, setResults] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  
  // AJOUT: États pour ECL
  const [eclResults, setEclResults] = useState<any>(null);
  const [calculatingECL, setCalculatingECL] = useState(false);

  const calculateRisk = () => {
    setCalculating(true);
    setTimeout(() => {
      const pd = Math.random() * 0.1;
      const lgd = parseFloat(exposure.lgd) || 0.45;
      const ead = parseFloat(exposure.amount) || 0;
      const ecl = pd * lgd * ead;

      setResults({
        pd: pd.toFixed(4),
        lgd: lgd.toFixed(2),
        ead: ead.toLocaleString(),
        ecl: ecl.toFixed(2),
        rwa: (ead * 1.06).toFixed(2),
        stage: pd > 0.05 ? 'Stage 2' : 'Stage 1',
        recommendations: [
          'Maintenir la surveillance standard',
          'Garanties adéquates',
          'Monitoring trimestriel recommandé',
          'Diversification sectorielle conseillée',
          'Révision annuelle du rating'
        ]
      });
      setCalculating(false);
    }, 1000);
  };

  // AJOUT: Fonction calculateECL
  const calculateECL = async () => {
    setCalculatingECL(true);
    try {
      const payload = {
        montant_exposition: parseFloat(exposure.amount) || 0,
        type_exposition: exposure.type || 'corporate',
        rating: exposure.rating || 'bbb',
        duree: parseInt(exposure.tenor) || 5,
        lgd: parseFloat(exposure.lgd) || 45,
        garanties: parseFloat(exposure.collateral) || 0
      };

      const response = await fetch('http://localhost:8000/api/calcul-ecl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erreur de calcul');
      
      const data = await response.json();
      setEclResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du calcul ECL');
    } finally {
      setCalculatingECL(false);
    }
  };

  const calculatePortfolioRisk = () => {
    const mockData = [
      { name: 'AAA', pd: 0.001, lgd: 0.10, ead: 5000000 },
      { name: 'AA', pd: 0.002, lgd: 0.15, ead: 8000000 },
      { name: 'A', pd: 0.005, lgd: 0.25, ead: 12000000 },
      { name: 'BBB', pd: 0.015, lgd: 0.35, ead: 15000000 },
      { name: 'BB', pd: 0.050, lgd: 0.45, ead: 7000000 },
      { name: 'B', pd: 0.100, lgd: 0.55, ead: 3000000 }
    ];

    const totalEAD = mockData.reduce((sum, item) => sum + item.ead, 0);
    const totalECL = mockData.reduce((sum, item) => sum + (item.pd * item.lgd * item.ead), 0);
    const averagePD = mockData.reduce((sum, item) => sum + item.pd * (item.ead / totalEAD), 0);

    setPortfolioData({
      distribution: mockData,
      totalEAD,
      totalECL,
      averagePD,
      heatmapData: generateHeatmapData()
    });
  };

  const generateHeatmapData = () => {
    const sectors = ['Finance', 'Immobilier', 'Industrie', 'Tech', 'Retail'];
    const ratings = ['AAA', 'AA', 'A', 'BBB', 'BB'];
    
    return sectors.map(sector => ({
      sector,
      ...ratings.reduce((acc, rating) => ({
        ...acc,
        [rating]: Math.random() * 10
      }), {})
    }));
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Fichier uploadé:', file.name);
      calculatePortfolioRisk();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 2px;
        }
      `}</style>
      
      {/* Header avec icône et titre */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #475569' }}>
        <div className="p-6">
          {/* MODIFICATION 1: Bouton Retour - redirection vers /outils-bancaires */}
          <button
            onClick={() => window.location.href = '/outils-bancaires'}
            className="mb-3 text-sm transition-colors flex items-center gap-1 hover:gap-2"
            style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          
          <h2 className="text-2xl font-semibold flex items-center gap-3" style={{ color: '#ffffff' }}>
            <Shield className="h-8 w-8" style={{ color: '#8b5cf6' }} />
            Credit Risk Analytics - IFRS 9
          </h2>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            Évaluation avancée du risque de crédit et calcul des provisions
          </p>
        </div>
        
        {/* Tabs */}
        <div className="px-6 pb-0">
          <div className="flex space-x-1">
            <button
              className={`py-3 px-6 rounded-t-lg transition-colors font-medium`}
              style={{
                backgroundColor: activeTab === 'single' ? '#6366f1' : 'transparent',
                color: activeTab === 'single' ? '#ffffff' : '#94a3b8',
                borderBottom: activeTab === 'single' ? '2px solid #6366f1' : '2px solid transparent'
              }}
              onClick={() => setActiveTab('single')}
            >
              Exposition Unique
            </button>
            <button
              className={`py-3 px-6 rounded-t-lg transition-colors font-medium`}
              style={{
                backgroundColor: activeTab === 'portfolio' ? '#6366f1' : 'transparent',
                color: activeTab === 'portfolio' ? '#ffffff' : '#94a3b8',
                borderBottom: activeTab === 'portfolio' ? '2px solid #6366f1' : '2px solid transparent'
              }}
              onClick={() => setActiveTab('portfolio')}
            >
              Portefeuille
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab content */}
        {activeTab === 'single' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Paramètres de l'exposition - Version améliorée */}
              <div className="rounded-lg" style={{ backgroundColor: '#1e293b' }}>
                {/* MODIFICATION 2: Ajout du bouton Calculer dans le header */}
                <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid #475569' }}>
                  <h3 className="text-lg font-medium" style={{ color: '#ffffff' }}>Paramètres de l'exposition</h3>
                  <button
                    onClick={calculateRisk}
                    className="px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5"
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      opacity: exposure.amount ? 1 : 0.6,
                      cursor: exposure.amount ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!exposure.amount}
                    onMouseEnter={(e) => exposure.amount && (e.currentTarget.style.backgroundColor = '#4f46e5')}
                    onMouseLeave={(e) => exposure.amount && (e.currentTarget.style.backgroundColor = '#6366f1')}
                  >
                    <Calculator size={16} />
                    Calculer
                  </button>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                        Montant de l'exposition (€)
                      </label>
                      <input
                        type="number"
                        placeholder="1000000"
                        value={exposure.amount}
                        onChange={(e) => setExposure({...exposure, amount: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-md transition-colors"
                        style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          color: '#ffffff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                        onBlur={(e) => e.target.style.borderColor = '#475569'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                          Type d'exposition
                        </label>
                        <select
                          value={exposure.type}
                          onChange={(e) => setExposure({...exposure, type: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-md transition-colors cursor-pointer"
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #475569',
                            color: '#ffffff'
                          }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="corporate">Corporate</option>
                          <option value="retail">Retail</option>
                          <option value="sovereign">Sovereign</option>
                          <option value="financial">Financial Institution</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                          Rating
                        </label>
                        <select
                          value={exposure.rating}
                          onChange={(e) => setExposure({...exposure, rating: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-md transition-colors cursor-pointer"
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #475569',
                            color: '#ffffff'
                          }}
                        >
                          <option value="">Sélectionner</option>
                          <option value="aaa">AAA</option>
                          <option value="aa">AA</option>
                          <option value="a">A</option>
                          <option value="bbb">BBB</option>
                          <option value="bb">BB</option>
                          <option value="b">B</option>
                          <option value="ccc">CCC</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                          Durée (années)
                        </label>
                        <input
                          type="number"
                          placeholder="5"
                          value={exposure.tenor}
                          onChange={(e) => setExposure({...exposure, tenor: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-md transition-colors"
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #475569',
                            color: '#ffffff'
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                          LGD estimée (%)
                        </label>
                        <input
                          type="number"
                          placeholder="45"
                          value={exposure.lgd}
                          onChange={(e) => setExposure({...exposure, lgd: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-md transition-colors"
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #475569',
                            color: '#ffffff'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                        Garanties (€)
                      </label>
                      <input
                        type="number"
                        placeholder="500000"
                        value={exposure.collateral}
                        onChange={(e) => setExposure({...exposure, collateral: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-md transition-colors"
                        style={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          color: '#ffffff'
                        }}
                      />
                    </div>

                    {/* MODIFICATION: Wrapper pour les deux boutons */}
                    <div className="space-y-3 mt-6">
                      <button
                        onClick={calculateRisk}
                        disabled={calculating}
                        className="w-full font-medium py-3 px-4 rounded-md transition-all flex items-center justify-center"
                        style={{
                          backgroundColor: calculating ? '#475569' : '#6366f1',
                          color: '#ffffff',
                          cursor: calculating ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => !calculating && (e.currentTarget.style.backgroundColor = '#4f46e5')}
                        onMouseLeave={(e) => !calculating && (e.currentTarget.style.backgroundColor = '#6366f1')}
                      >
                        <Calculator className="mr-2 h-5 w-5" />
                        {calculating ? 'Calcul en cours...' : 'Calculer le risque'}
                      </button>

                      {/* AJOUT: Bouton Calculer ECL */}
                      <button
                        onClick={calculateECL}
                        disabled={calculatingECL || !exposure.amount}
                        className="w-full font-medium py-3 px-4 rounded-md transition-all flex items-center justify-center"
                        style={{
                          backgroundColor: calculatingECL || !exposure.amount ? '#475569' : '#10b981',
                          color: '#ffffff',
                          cursor: calculatingECL || !exposure.amount ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => !calculatingECL && exposure.amount && (e.currentTarget.style.backgroundColor = '#059669')}
                        onMouseLeave={(e) => !calculatingECL && exposure.amount && (e.currentTarget.style.backgroundColor = '#10b981')}
                      >
                        <TrendingUp className="mr-2 h-5 w-5" />
                        {calculatingECL ? 'Calcul ECL en cours...' : 'Calculer la Perte Attendue'}
                      </button>
                    </div>

                    {/* AJOUT: Affichage des résultats ECL */}
                    {eclResults && (
                      <div className="mt-4 rounded-lg p-4 animate-fadeIn" style={{ 
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569'
                      }}>
                        <h4 className="text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
                          Résultats ECL (Expected Credit Loss)
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: '#94a3b8' }}>EAD :</span>
                            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                              €{eclResults.ead?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: '#94a3b8' }}>PD :</span>
                            <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>
                              {((eclResults.pd || 0) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm" style={{ color: '#94a3b8' }}>LGD :</span>
                            <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>
                              {((eclResults.lgd || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #475569' }}>
                            <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Perte attendue :</span>
                            <span className="text-base font-bold" style={{ color: '#ef4444' }}>
                              €{eclResults.ecl?.toLocaleString() || 0}
                            </span>
                          </div>
                          {eclResults.stage && (
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm" style={{ color: '#94a3b8' }}>Stage :</span>
                              <span className="text-xs px-2 py-1 rounded" style={{
                                backgroundColor: eclResults.stage === 'Stage 1' ? '#d1fae5' : '#fef3c7',
                                color: eclResults.stage === 'Stage 1' ? '#065f46' : '#92400e'
                              }}>
                                {eclResults.stage}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Résultats de l'évaluation - Version améliorée */}
              {results && (
                <div className="rounded-lg animate-fadeIn" style={{ backgroundColor: '#1e293b' }}>
                  <div className="p-5" style={{ borderBottom: '1px solid #475569' }}>
                    <h3 className="text-lg font-medium" style={{ color: '#ffffff' }}>Résultats de l'évaluation</h3>
                  </div>
                  <div className="p-5">
                    {/* Grille des 4 métriques */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* PD */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>PD</span>
                          <TrendingUp className="w-4 h-4" style={{ color: '#3b82f6' }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                          {(parseFloat(results.pd) * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Probability of Default</p>
                      </div>

                      {/* LGD */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>LGD</span>
                          <BarChart className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{results.lgd}%</p>
                        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Loss Given Default</p>
                      </div>

                      {/* EAD */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>EAD</span>
                          <Shield className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>€{results.ead}</p>
                        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Exposure at Default</p>
                      </div>

                      {/* ECL */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>ECL</span>
                          <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                          €{parseFloat(results.ecl).toLocaleString()}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Expected Credit Loss</p>
                      </div>
                    </div>

                    {/* Calcul terminé */}
                    <div className="rounded-lg p-3 mb-4" style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)' 
                    }}>
                      <div className="flex items-center text-sm" style={{ color: '#10b981' }}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Calcul terminé avec succès
                      </div>
                    </div>

                    {/* Stage IFRS 9 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm" style={{ color: '#94a3b8' }}>Stage IFRS 9</span>
                      <span className="text-sm px-3 py-1 rounded-full" style={{
                        backgroundColor: results.stage === 'Stage 1' ? '#d1fae5' : '#fef3c7',
                        color: results.stage === 'Stage 1' ? '#065f46' : '#92400e'
                      }}>
                        {results.stage}
                      </span>
                    </div>

                    {/* Recommandations */}
                    <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a' }}>
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#ffffff' }}>Recommandations</h4>
                      <div className="space-y-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {results.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <span className="mr-2" style={{ color: '#10b981' }}>•</span>
                            <span className="text-sm" style={{ color: '#94a3b8' }}>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={calculateRisk}
                        className="py-2.5 px-4 rounded-md transition-all flex items-center justify-center font-medium"
                        style={{
                          border: '1px solid #475569',
                          backgroundColor: 'transparent',
                          color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Recalculer
                      </button>
                      <button
                        className="py-2.5 px-4 rounded-md transition-all flex items-center justify-center font-medium"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Exporter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyse graphique */}
            {results && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>Analyse de sensibilité</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { pd: 0.01, ecl: 4500 },
                      { pd: 0.03, ecl: 13500 },
                      { pd: 0.05, ecl: 22500 },
                      { pd: 0.07, ecl: 31500 },
                      { pd: 0.10, ecl: 45000 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="pd" 
                      label={{ value: 'Probabilité de défaut', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                      stroke="#94a3b8"
                    />
                    <YAxis 
                      label={{ value: 'ECL (€)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                      stroke="#94a3b8"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '6px'
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Line type="monotone" dataKey="ecl" stroke="#ef4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>Analyse du portefeuille</h3>
              <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
                Importez votre portefeuille pour une analyse complète
              </p>
              <div className="space-y-4">
                <div className="rounded-lg p-8 text-center" style={{ 
                  border: '2px dashed #475569',
                  backgroundColor: '#0f172a'
                }}>
                  <input
                    type="file"
                    id="portfolio-upload"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="portfolio-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      <Upload className="h-10 w-10" style={{ color: '#6366f1' }} />
                      <p className="text-sm" style={{ color: '#ffffff' }}>
                        Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        Formats supportés: CSV, XLSX
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={calculatePortfolioRisk}
                    className="font-medium py-3 px-6 rounded-md transition-all flex items-center"
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                  >
                    <BarChart className="mr-2 h-5 w-5" />
                    Utiliser données de démonstration
                  </button>
                </div>
              </div>
            </div>

            {portfolioData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                    <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                      €{(portfolioData.totalEAD / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Exposition totale</p>
                  </div>
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                    <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                      €{(portfolioData.totalECL / 1000).toFixed(0)}K
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Pertes attendues (ECL)</p>
                  </div>
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                      {(portfolioData.averagePD * 100).toFixed(2)}%
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>PD moyenne pondérée</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                    <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>Distribution par rating</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={portfolioData.distribution}
                          dataKey="ead"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry: any) => `${entry.name}: ${(entry.ead / 1000000).toFixed(1)}M`}
                        >
                          {portfolioData.distribution.map((_entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-lg p-6" style={{ backgroundColor: '#1e293b' }}>
                    <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>Matrice de concentration</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={portfolioData.heatmapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="sector" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        {['AAA', 'AA', 'A', 'BBB', 'BB'].map((rating, index) => (
                          <Bar key={rating} dataKey={rating} stackId="a" fill={COLORS[index]} />
                        ))}
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export par défaut
export default CreditRiskModule;

// Export nommé pour supporter l'import { CreditRiskModule } from '...'
export { CreditRiskModule };