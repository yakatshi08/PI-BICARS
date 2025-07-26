import React, { useState, useEffect } from 'react';
import {
  Calculator, TrendingUp, AlertTriangle, Activity,
  FileText, Download, Upload, Info, ArrowLeft,
  BarChart3, Grid3x3, Target, ChevronRight,
  Percent, TrendingDown, Calendar, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ScatterChart, Scatter
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface TriangleData {
  origin: number;
  development: number;
  claims: number;
}

interface DevelopmentFactors {
  period: number;
  factor: number;
  cumulative: number;
}

const ActuarialProvisioning: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore();
  const [selectedMethod, setSelectedMethod] = useState<'chainLadder' | 'bf' | 'capeCod'>('chainLadder');
  const [triangleData, setTriangleData] = useState<number[][]>([]);
  const [developmentFactors, setDevelopmentFactors] = useState<DevelopmentFactors[]>([]);
  const [reserves, setReserves] = useState<any>(null);
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  // Données exemple de triangle de développement
  const sampleTriangle = [
    [1000, 1750, 2000, 2100, 2150, 2180],
    [1100, 1900, 2200, 2350, 2400, null],
    [1200, 2100, 2450, 2600, null, null],
    [1350, 2350, 2750, null, null, null],
    [1500, 2600, null, null, null, null],
    [1650, null, null, null, null, null]
  ];

  useEffect(() => {
    setTriangleData(sampleTriangle);
    calculateDevelopmentFactors();
  }, []);

  const calculateDevelopmentFactors = () => {
    const factors: DevelopmentFactors[] = [];
    let cumulative = 1;

    // Calcul des facteurs de développement
    for (let dev = 0; dev < 5; dev++) {
      let sumCurrent = 0;
      let sumPrevious = 0;
      let count = 0;

      for (let origin = 0; origin < sampleTriangle.length - dev - 1; origin++) {
        if (sampleTriangle[origin][dev] && sampleTriangle[origin][dev + 1]) {
          sumPrevious += sampleTriangle[origin][dev];
          sumCurrent += sampleTriangle[origin][dev + 1];
          count++;
        }
      }

      const factor = count > 0 ? sumCurrent / sumPrevious : 1;
      cumulative *= factor;

      factors.push({
        period: dev + 1,
        factor: factor,
        cumulative: cumulative
      });
    }

    setDevelopmentFactors(factors);
    calculateReserves(factors);
  };

  const calculateReserves = (factors: DevelopmentFactors[]) => {
    let totalIBNR = 0;
    let totalUltimate = 0;
    let totalPaid = 0;
    const reservesByYear: any[] = [];

    sampleTriangle.forEach((row, originIndex) => {
      let lastValue = 0;
      let lastDevIndex = 0;

      // Trouver la dernière valeur non nulle
      for (let i = row.length - 1; i >= 0; i--) {
        if (row[i] !== null) {
          lastValue = row[i];
          lastDevIndex = i;
          break;
        }
      }

      // Calculer l'ultimate
      let ultimateValue = lastValue;
      for (let i = lastDevIndex; i < factors.length; i++) {
        ultimateValue *= factors[i].factor;
      }

      const ibnr = ultimateValue - lastValue;
      totalIBNR += ibnr;
      totalUltimate += ultimateValue;
      totalPaid += lastValue;

      reservesByYear.push({
        year: 2019 + originIndex,
        paid: lastValue,
        ultimate: Math.round(ultimateValue),
        ibnr: Math.round(ibnr),
        ratio: (ibnr / ultimateValue * 100).toFixed(1)
      });
    });

    setReserves({
      total: {
        paid: Math.round(totalPaid),
        ultimate: Math.round(totalUltimate),
        ibnr: Math.round(totalIBNR),
        ratio: (totalIBNR / totalUltimate * 100).toFixed(1)
      },
      byYear: reservesByYear
    });
  };

  // Données pour les graphiques
  const evolutionData = developmentFactors.map(df => ({
    period: `Dev ${df.period}`,
    factor: df.factor,
    cumulative: df.cumulative
  }));

  const reservesData = reserves?.byYear || [];

  const methodsComparison = [
    { method: 'Chain Ladder', reserves: 2450000, confidence: 85 },
    { method: 'Bornhuetter-Ferguson', reserves: 2380000, confidence: 90 },
    { method: 'Cape Cod', reserves: 2420000, confidence: 88 }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/actuarial-analytics')}
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
            } transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Modèles de Provisionnement
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Chain Ladder, Bornhuetter-Ferguson & Triangles de développement
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="h-5 w-5" />
            <span>Import Triangle</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-5 w-5" />
            <span>Export Analyse</span>
          </button>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <Calculator className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {reserves?.total?.ultimate ? `${(reserves.total.ultimate / 1000).toFixed(0)}K€` : '-'}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sinistres Ultimate
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              IBNR
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {reserves?.total?.ibnr ? `${(reserves.total.ibnr / 1000).toFixed(0)}K€` : '-'}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Provisions IBNR
          </p>
          <div className="mt-2 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-amber-500">{reserves?.total?.ratio || '0'}% du total</span>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <TrendingUp className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dev Factor
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {developmentFactors[0]?.factor.toFixed(3) || '-'}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Facteur 12-24 mois
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <Percent className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Confiance
            </span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {confidenceLevel}%
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Niveau de confiance
          </p>
        </div>
      </div>

      {/* Method Selection */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Méthode de Provisionnement
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedMethod('chainLadder')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedMethod === 'chainLadder'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : darkMode
                ? 'border-gray-700 hover:border-gray-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Chain Ladder
            </h4>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Méthode déterministe classique
            </p>
          </button>
          
          <button
            onClick={() => setSelectedMethod('bf')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedMethod === 'bf'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : darkMode
                ? 'border-gray-700 hover:border-gray-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bornhuetter-Ferguson
            </h4>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Combine a priori et expérience
            </p>
          </button>
          
          <button
            onClick={() => setSelectedMethod('capeCod')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedMethod === 'capeCod'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : darkMode
                ? 'border-gray-700 hover:border-gray-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Cape Cod
            </h4>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Approche par exposition
            </p>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triangle de développement */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Triangle de Développement
            </h3>
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sinistres cumulés (K€)
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="py-2 px-3 text-left">Origine</th>
                  {[1, 2, 3, 4, 5, 6].map(dev => (
                    <th key={dev} className="py-2 px-3 text-center">
                      Dev {dev}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {triangleData.map((row, originIndex) => (
                  <tr
                    key={originIndex}
                    className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <td className="py-2 px-3 font-medium">
                      {2019 + originIndex}
                    </td>
                    {row.map((value, devIndex) => (
                      <td
                        key={devIndex}
                        className={`py-2 px-3 text-center ${
                          value === null
                            ? darkMode
                              ? 'bg-gray-900/50 text-purple-400 italic'
                              : 'bg-gray-50 text-purple-600 italic'
                            : ''
                        }`}
                      >
                        {value !== null ? value : 'proj.'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facteurs de développement */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Facteurs de Développement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="period" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="factor" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
                {evolutionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : '#A78BFA'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Réserves par année */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Réserves IBNR par Année
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reservesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="year" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => `${(value / 1000).toFixed(0)}K€`}
              />
              <Area
                type="monotone"
                dataKey="paid"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Payé"
              />
              <Area
                type="monotone"
                dataKey="ibnr"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="IBNR"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparaison des méthodes */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Comparaison des Méthodes
          </h3>
          <div className="space-y-4">
            {methodsComparison.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {method.method}
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(method.reserves / 1000).toFixed(0)}K€
                  </span>
                </div>
                <div className="relative">
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${method.confidence}%` }}
                    />
                  </div>
                  <span className={`absolute right-0 -top-5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {method.confidence}% confiance
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Recalculer</span>
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Rapport</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className={`mt-6 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6`}>
        <div className="flex items-start space-x-3">
          <Info className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`} />
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              À propos des méthodes de provisionnement
            </h4>
            <p className={`mt-1 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              La méthode <strong>Chain Ladder</strong> est la plus utilisée pour sa simplicité et sa robustesse. 
              <strong> Bornhuetter-Ferguson</strong> combine l'expérience passée avec une estimation a priori du ratio S/P. 
              <strong> Cape Cod</strong> utilise l'exposition au risque pour améliorer les projections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActuarialProvisioning;