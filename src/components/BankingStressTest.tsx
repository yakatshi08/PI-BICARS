import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, TrendingDown, Shield, Activity,
  BarChart3, Download, Info, ChevronRight,
  Zap, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, LineChart, Line
} from 'recharts';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

// Types pour les stress tests
interface StressScenario {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  impacts: {
    gdpGrowth: number;
    unemployment: number;
    interestRates: number;
    propertyPrices: number;
    equityPrices: number;
    creditLosses: number;
  };
}

interface StressTestResult {
  metric: string;
  baseline: number;
  stressed: number;
  impact: number;
  status: 'pass' | 'warning' | 'fail';
  threshold: number;
}

export const BankingStressTest: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string>('baseline');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Scénarios BCE standardisés
  const scenarios: Record<string, StressScenario> = {
    baseline: {
      id: 'baseline',
      name: 'Scénario Central',
      description: 'Évolution économique normale selon les prévisions BCE',
      severity: 'mild',
      impacts: {
        gdpGrowth: -0.5,
        unemployment: 0.5,
        interestRates: 0.25,
        propertyPrices: -5,
        equityPrices: -10,
        creditLosses: 0.5
      }
    },
    adverse: {
      id: 'adverse',
      name: 'Scénario Adverse',
      description: 'Récession modérée avec tensions financières',
      severity: 'moderate',
      impacts: {
        gdpGrowth: -2.5,
        unemployment: 2.5,
        interestRates: -0.5,
        propertyPrices: -15,
        equityPrices: -30,
        creditLosses: 2.5
      }
    },
    severelyAdverse: {
      id: 'severelyAdverse',
      name: 'Scénario Sévèrement Adverse',
      description: 'Crise financière majeure avec récession profonde',
      severity: 'severe',
      impacts: {
        gdpGrowth: -5.0,
        unemployment: 5.0,
        interestRates: -1.5,
        propertyPrices: -30,
        equityPrices: -50,
        creditLosses: 5.0
      }
    },
    pandemic: {
      id: 'pandemic',
      name: 'Scénario Pandémique',
      description: 'Choc systémique type COVID avec arrêt économique',
      severity: 'extreme',
      impacts: {
        gdpGrowth: -8.0,
        unemployment: 8.0,
        interestRates: -2.0,
        propertyPrices: -25,
        equityPrices: -40,
        creditLosses: 7.0
      }
    }
  };

  // Calcul des résultats du stress test
  const stressTestResults = useMemo((): StressTestResult[] => {
    const scenario = scenarios[selectedScenario];
    const baseMetrics = {
      cet1: 14.2,
      lcr: 142,
      nsfr: 118,
      npl: 2.0,
      leverage: 5.2,
      roe: 12.8
    };

    // Formules d'impact basées sur les méthodologies BCE
    const results: StressTestResult[] = [
      {
        metric: 'CET1 Ratio',
        baseline: baseMetrics.cet1,
        stressed: Math.max(
          baseMetrics.cet1 - (scenario.impacts.creditLosses * 1.5) - (scenario.impacts.gdpGrowth * 0.3),
          0
        ),
        impact: 0,
        status: 'pass',
        threshold: 10.5
      },
      {
        metric: 'LCR',
        baseline: baseMetrics.lcr,
        stressed: Math.max(
          baseMetrics.lcr - (scenario.impacts.creditLosses * 8) - Math.abs(scenario.impacts.equityPrices * 0.5),
          50
        ),
        impact: 0,
        status: 'pass',
        threshold: 100
      },
      {
        metric: 'NSFR',
        baseline: baseMetrics.nsfr,
        stressed: Math.max(
          baseMetrics.nsfr - (scenario.impacts.creditLosses * 4),
          50
        ),
        impact: 0,
        status: 'pass',
        threshold: 100
      },
      {
        metric: 'NPL Ratio',
        baseline: baseMetrics.npl,
        stressed: Math.min(
          baseMetrics.npl + scenario.impacts.creditLosses + (scenario.impacts.unemployment * 0.5),
          20
        ),
        impact: 0,
        status: 'pass',
        threshold: 7.0
      },
      {
        metric: 'Leverage Ratio',
        baseline: baseMetrics.leverage,
        stressed: Math.max(
          baseMetrics.leverage - (scenario.impacts.creditLosses * 0.4),
          0
        ),
        impact: 0,
        status: 'pass',
        threshold: 3.0
      },
      {
        metric: 'ROE',
        baseline: baseMetrics.roe,
        stressed: Math.max(
          baseMetrics.roe - scenario.impacts.creditLosses * 2 - Math.abs(scenario.impacts.gdpGrowth),
          -20
        ),
        impact: 0,
        status: 'pass',
        threshold: 0
      }
    ];

    // Calculer l'impact et le statut
    results.forEach(result => {
      result.impact = ((result.stressed - result.baseline) / result.baseline) * 100;
      
      if (result.metric === 'NPL Ratio') {
        result.status = result.stressed > result.threshold ? 'fail' : 
                       result.stressed > result.threshold * 0.7 ? 'warning' : 'pass';
      } else {
        result.status = result.stressed < result.threshold ? 'fail' : 
                       result.stressed < result.threshold * 1.2 ? 'warning' : 'pass';
      }
    });

    return results;
  }, [selectedScenario]);

  // Données pour le graphique radar
  const radarData = stressTestResults.map(result => ({
    metric: result.metric,
    baseline: (result.baseline / result.threshold) * 100,
    stressed: (result.stressed / result.threshold) * 100
  }));

  // Simulation du test
  const runStressTest = () => {
    setIsRunning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Couleurs selon la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'green';
      case 'moderate': return 'yellow';
      case 'severe': return 'orange';
      case 'extreme': return 'red';
      default: return 'gray';
    }
  };

  // Résumé global
  const globalStatus = stressTestResults.every(r => r.status === 'pass') ? 'pass' :
                      stressTestResults.some(r => r.status === 'fail') ? 'fail' : 'warning';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Stress Tests BCE
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tests de résistance selon la méthodologie BCE/SSM
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/banking/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour Dashboard
            </button>
            <button
              onClick={() => {/* Export logic */}}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export BCE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sélection du scénario */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Scénarios de Stress
              </h3>
              <div className="space-y-3">
                {Object.values(scenarios).map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedScenario === scenario.id
                        ? `border-${getSeverityColor(scenario.severity)}-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`
                        : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {scenario.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scenario.severity === 'mild' ? 'bg-green-100 text-green-800' :
                        scenario.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        scenario.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {scenario.description}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={runStressTest}
                disabled={isRunning}
                className={`mt-6 w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isRunning ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Test en cours... {progress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span>Lancer le Stress Test</span>
                  </div>
                )}
              </button>
            </div>

            {/* Paramètres du scénario */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Impacts Économiques
              </h3>
              <div className="space-y-3">
                {Object.entries(scenarios[selectedScenario].impacts).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {key === 'gdpGrowth' ? 'Croissance PIB' :
                       key === 'unemployment' ? 'Chômage' :
                       key === 'interestRates' ? 'Taux d\'intérêt' :
                       key === 'propertyPrices' ? 'Prix immobilier' :
                       key === 'equityPrices' ? 'Marchés actions' :
                       'Pertes crédit'}
                    </span>
                    <span className={`font-medium ${
                      value < 0 ? 'text-red-600' : value > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {value > 0 ? '+' : ''}{value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résultats des stress tests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vue d'ensemble */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Résultats du Stress Test
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  globalStatus === 'pass' ? 'bg-green-100 text-green-800' :
                  globalStatus === 'fail' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {globalStatus === 'pass' ? <CheckCircle className="h-4 w-4" /> :
                   globalStatus === 'fail' ? <XCircle className="h-4 w-4" /> :
                   <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {globalStatus === 'pass' ? 'Réussi' :
                     globalStatus === 'fail' ? 'Échoué' : 'Attention'}
                  </span>
                </div>
              </div>

              {/* Tableau des résultats */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Métrique
                      </th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Baseline
                      </th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stressé
                      </th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Impact
                      </th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Seuil
                      </th>
                      <th className={`text-center py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stressTestResults.map((result, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {result.metric}
                        </td>
                        <td className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {result.baseline.toFixed(1)}%
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${
                          result.impact < -20 ? 'text-red-600' :
                          result.impact < -10 ? 'text-orange-600' :
                          result.impact < 0 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {result.stressed.toFixed(1)}%
                        </td>
                        <td className={`text-right py-3 px-4 ${
                          result.impact < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {result.impact > 0 ? '+' : ''}{result.impact.toFixed(1)}%
                        </td>
                        <td className={`text-right py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {result.metric === 'NPL Ratio' ? '<' : '>'}{result.threshold}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            result.status === 'pass' ? 'bg-green-100 text-green-800' :
                            result.status === 'fail' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status === 'pass' ? 'Pass' :
                             result.status === 'fail' ? 'Fail' : 'Warning'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Graphique radar */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyse Comparative
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 150]}
                    tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                  />
                  <Radar
                    name="Baseline"
                    dataKey="baseline"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Stressé"
                    dataKey="stressed"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommandations */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recommandations BCE
              </h3>
              <div className="space-y-3">
                {stressTestResults.filter(r => r.status !== 'pass').map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    result.status === 'fail' 
                      ? darkMode ? 'bg-red-900/20' : 'bg-red-50'
                      : darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                  } border ${
                    result.status === 'fail' ? 'border-red-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        result.status === 'fail' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {result.metric} - Action requise
                        </h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {result.metric === 'CET1 Ratio' ? 
                            'Augmenter les fonds propres ou réduire les actifs pondérés' :
                           result.metric === 'LCR' ?
                            'Améliorer la position de liquidité à court terme' :
                           result.metric === 'NPL Ratio' ?
                            'Renforcer les procédures de recouvrement et provisionnement' :
                            'Optimiser la structure de financement'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {globalStatus === 'pass' && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} border border-green-500`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Test réussi
                        </h4>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          La banque démontre une résilience adéquate face au scénario de stress. 
                          Continuer à surveiller les indicateurs et maintenir les buffers de capital.
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