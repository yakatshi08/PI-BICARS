import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, TrendingDown, AlertTriangle,
  Settings, Download, RefreshCw, Info, ChevronRight,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Types pour la simulation
interface SimulationParams {
  growthRate: number;
  interestRateChange: number;
  nplGrowth: number;
  regulatoryChange: number;
  scenario: 'optimistic' | 'baseline' | 'pessimistic';
}

interface SimulationResult {
  year: number;
  quarter: string;
  cet1: number;
  lcr: number;
  nsfr: number;
  npl: number;
  nii: number;
  roe: number;
}

export const BankingSimulation: React.FC = () => {
  const navigate = useNavigate();
  
  // Paramètres de simulation
  const [params, setParams] = useState<SimulationParams>({
    growthRate: 5,
    interestRateChange: 0.5,
    nplGrowth: 0.2,
    regulatoryChange: 0,
    scenario: 'baseline'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Scénarios prédéfinis
  const scenarios = {
    optimistic: {
      growthRate: 8,
      interestRateChange: 1.0,
      nplGrowth: -0.3,
      regulatoryChange: 0.5,
      name: 'Optimiste',
      description: 'Croissance forte, amélioration du risque',
      color: '#10b981'
    },
    baseline: {
      growthRate: 5,
      interestRateChange: 0.5,
      nplGrowth: 0.2,
      regulatoryChange: 0,
      name: 'Central',
      description: 'Évolution normale des marchés',
      color: '#6366f1'
    },
    pessimistic: {
      growthRate: 2,
      interestRateChange: -0.5,
      nplGrowth: 1.5,
      regulatoryChange: -1,
      name: 'Pessimiste',
      description: 'Ralentissement économique',
      color: '#ef4444'
    }
  };

  // Calcul de la simulation
  const simulationResults = useMemo(() => {
    const results: SimulationResult[] = [];
    const baseMetrics = {
      cet1: 14.2,
      lcr: 142,
      nsfr: 118,
      npl: 2.0,
      nii: 2.3,
      roe: 12.8
    };

    for (let year = 0; year <= 3; year++) {
      for (let q = 1; q <= 4; q++) {
        const period = year * 4 + q - 1;
        const growthFactor = Math.pow(1 + params.growthRate / 100 / 4, period);
        const interestFactor = 1 + (params.interestRateChange * period / 12);
        const nplFactor = Math.pow(1 + params.nplGrowth / 100 / 4, period);

        results.push({
          year: 2025 + year,
          quarter: `Q${q} ${2025 + year}`,
          cet1: Math.max(
            baseMetrics.cet1 + (params.regulatoryChange * period / 12) - (params.nplGrowth * period / 24),
            0
          ),
          lcr: Math.max(
            baseMetrics.lcr * (1 + params.growthRate / 200) - (params.nplGrowth * 2),
            100
          ),
          nsfr: Math.max(
            baseMetrics.nsfr * (1 + params.growthRate / 300),
            100
          ),
          npl: Math.min(
            baseMetrics.npl * nplFactor,
            10
          ),
          nii: baseMetrics.nii * growthFactor * interestFactor,
          roe: Math.max(
            baseMetrics.roe * interestFactor * (1 - params.nplGrowth / 100),
            0
          )
        });
      }
    }

    return results;
  }, [params]);

  // Métriques à la fin de la simulation
  const finalMetrics = simulationResults[simulationResults.length - 1];
  const initialMetrics = simulationResults[0];

  // Calcul des variations
  const getVariation = (final: number, initial: number) => {
    return ((final - initial) / initial * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Simulation Budgétaire 3 Ans
            </h1>
            <p className="mt-1 text-[#94a3b8]">
              Projection des ratios prudentiels et performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/banking/dashboard')}
              className="px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition-colors"
            >
              Retour Dashboard
            </button>
            <button
              onClick={() => {
                alert('Export de la simulation en cours...');
              }}
              className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sélection du scénario */}
            <div className="rounded-xl p-6 bg-[#1e293b]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Scénario de simulation
              </h3>
              <div className="space-y-3">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setParams({
                        ...params,
                        ...scenarios[key as keyof typeof scenarios],
                        scenario: key as SimulationParams['scenario']
                      });
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      params.scenario === key
                        ? `border-[${scenario.color}] bg-[#334155]`
                        : 'border-[#334155] hover:border-[#475569]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">
                        {scenario.name}
                      </span>
                      {params.scenario === key && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scenario.color }} />
                      )}
                    </div>
                    <p className="text-sm text-left text-[#94a3b8]">
                      {scenario.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Paramètres de simulation */}
            <div className="rounded-xl p-6 bg-[#1e293b]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Paramètres
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-[#94a3b8] hover:text-[#6366f1]"
                >
                  {showAdvanced ? 'Masquer' : 'Avancés'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Taux de croissance */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#94a3b8]">
                    Taux de croissance annuel
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="-5"
                      max="15"
                      step="0.5"
                      value={params.growthRate}
                      onChange={(e) => setParams({ ...params, growthRate: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-white">
                      {params.growthRate}%
                    </span>
                  </div>
                </div>

                {/* Variation taux d'intérêt */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#94a3b8]">
                    Variation taux d'intérêt
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={params.interestRateChange}
                      onChange={(e) => setParams({ ...params, interestRateChange: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-white">
                      {params.interestRateChange > 0 ? '+' : ''}{params.interestRateChange}%
                    </span>
                  </div>
                </div>

                {showAdvanced && (
                  <>
                    {/* Croissance NPL */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#94a3b8]">
                        Évolution NPL
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-1"
                          max="3"
                          step="0.1"
                          value={params.nplGrowth}
                          onChange={(e) => setParams({ ...params, nplGrowth: Number(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-white">
                          {params.nplGrowth > 0 ? '+' : ''}{params.nplGrowth}%
                        </span>
                      </div>
                    </div>

                    {/* Impact réglementaire */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#94a3b8]">
                        Impact réglementaire
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={params.regulatoryChange}
                          onChange={(e) => setParams({ ...params, regulatoryChange: Number(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-white">
                          {params.regulatoryChange > 0 ? '+' : ''}{params.regulatoryChange}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setParams({
                  growthRate: 5,
                  interestRateChange: 0.5,
                  nplGrowth: 0.2,
                  regulatoryChange: 0,
                  scenario: 'baseline'
                })}
                className="mt-4 w-full px-4 py-2 rounded-lg transition-colors bg-[#334155] hover:bg-[#475569] text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Graphiques de simulation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Évolution des ratios prudentiels */}
            <div className="rounded-xl p-6 bg-[#1e293b]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Projection des Ratios Prudentiels
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="quarter" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    interval={3}
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={10.5} label="CET1 Min" stroke="#ef4444" strokeDasharray="5 5" />
                  <ReferenceLine y={100} label="LCR/NSFR Min" stroke="#f59e0b" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="cet1" stroke="#6366f1" strokeWidth={2} name="CET1 %" />
                  <Line type="monotone" dataKey="lcr" stroke="#10b981" strokeWidth={2} name="LCR %" />
                  <Line type="monotone" dataKey="nsfr" stroke="#f59e0b" strokeWidth={2} name="NSFR %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Évolution NPL et NII */}
            <div className="rounded-xl p-6 bg-[#1e293b]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Qualité du Crédit et Revenus
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="quarter" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    interval={3}
                  />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <ReferenceLine yAxisId="left" y={5} label="NPL Max" stroke="#ef4444" strokeDasharray="5 5" />
                  <Line yAxisId="left" type="monotone" dataKey="npl" stroke="#ef4444" strokeWidth={2} name="NPL %" />
                  <Line yAxisId="right" type="monotone" dataKey="nii" stroke="#10b981" strokeWidth={2} name="NII (B€)" />
                  <Line yAxisId="left" type="monotone" dataKey="roe" stroke="#8b5cf6" strokeWidth={2} name="ROE %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Résumé de fin de période */}
            <div className="rounded-xl p-6 bg-[#1e293b]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Résumé à Horizon 3 Ans
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'CET1 Final', value: finalMetrics.cet1.toFixed(1), unit: '%', key: 'cet1' },
                  { label: 'LCR Final', value: finalMetrics.lcr.toFixed(0), unit: '%', key: 'lcr' },
                  { label: 'NSFR Final', value: finalMetrics.nsfr.toFixed(0), unit: '%', key: 'nsfr' },
                  { label: 'NPL Final', value: finalMetrics.npl.toFixed(1), unit: '%', key: 'npl' },
                  { label: 'NII Final', value: finalMetrics.nii.toFixed(1), unit: 'B€', key: 'nii' },
                  { label: 'ROE Final', value: finalMetrics.roe.toFixed(1), unit: '%', key: 'roe' }
                ].map((metric) => {
                  const variation = getVariation(
                    finalMetrics[metric.key as keyof SimulationResult] as number,
                    initialMetrics[metric.key as keyof SimulationResult] as number
                  );
                  const isPositive = Number(variation) > 0;
                  const isNegativeGood = metric.key === 'npl';
                  
                  return (
                    <div
                      key={metric.key}
                      className="p-4 rounded-lg bg-[#334155]"
                    >
                      <p className="text-sm text-[#94a3b8]">
                        {metric.label}
                      </p>
                      <p className="text-xl font-bold mt-1 text-white">
                        {metric.value}{metric.unit}
                      </p>
                      <div className={`flex items-center mt-2 text-sm ${
                        isNegativeGood 
                          ? (isPositive ? 'text-[#ef4444]' : 'text-[#10b981]')
                          : (isPositive ? 'text-[#10b981]' : 'text-[#ef4444]')
                      }`}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        <span>{variation}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alertes basées sur la simulation */}
              <div className="mt-6 space-y-3">
                {finalMetrics.cet1 < 10.5 && (
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-500">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">
                          Alerte CET1
                        </h4>
                        <p className="text-sm mt-1 text-[#94a3b8]">
                          Le ratio CET1 projeté ({finalMetrics.cet1.toFixed(1)}%) est inférieur au minimum réglementaire. 
                          Actions correctives nécessaires.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {finalMetrics.npl > 5 && (
                  <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">
                          NPL Élevé
                        </h4>
                        <p className="text-sm mt-1 text-[#94a3b8]">
                          Le ratio NPL projeté ({finalMetrics.npl.toFixed(1)}%) dépasse le seuil d'alerte. 
                          Renforcer la gestion du risque crédit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {params.scenario === 'optimistic' && (
                  <div className="p-4 rounded-lg bg-green-900/20 border border-green-500">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">
                          Scénario Favorable
                        </h4>
                        <p className="text-sm mt-1 text-[#94a3b8]">
                          Tous les indicateurs restent dans les limites acceptables. 
                          Opportunité d'expansion ou d'optimisation du capital.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingSimulation;