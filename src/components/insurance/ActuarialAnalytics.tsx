import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Info,
  Download,
  Calendar,
  Users,
  HeartPulse,
  ChevronRight
} from 'lucide-react';

// Composants UI simplifiés
const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-slate-700">{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-600 text-white',
    destructive: 'bg-red-500 text-white',
    secondary: 'bg-slate-600 text-white',
    outline: 'bg-emerald-100 text-emerald-900 border-emerald-900'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'default', className = '' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
      ${variant === 'outline' 
        ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700' 
        : 'bg-indigo-500 text-white hover:bg-indigo-600'} ${className}`}
  >
    {children}
  </button>
);

const Alert = ({ children, className = '' }) => (
  <div className={`bg-slate-700 border border-slate-600 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-slate-300 ${className}`}>{children}</div>
);

// Types pour les données actuarielles
interface TriangleData {
  year: number;
  development: number[];
  ultimate?: number;
}

interface ReserveEstimate {
  method: string;
  estimate: number;
  variance: number;
  confidence95: [number, number];
}

interface MortalityData {
  age: number;
  qx: number;
  lx: number;
  dx: number;
  ex: number;
}

const ActuarialAnalytics: React.FC = () => {
  const [selectedLineOfBusiness, setSelectedLineOfBusiness] = useState('motor');
  const [activeTab, setActiveTab] = useState('reserves');
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [mortalityTable, setMortalityTable] = useState('TF00-02');
  
  // Données du triangle de développement
  const triangleData: TriangleData[] = useMemo(() => [
    { year: 2019, development: [2500000, 3800000, 4200000, 4350000, 4400000] },
    { year: 2020, development: [2700000, 4100000, 4550000, 4700000] },
    { year: 2021, development: [2900000, 4400000, 4900000] },
    { year: 2022, development: [3100000, 4700000] },
    { year: 2023, development: [3300000] },
    { year: 2024, development: [3500000] }
  ], [selectedLineOfBusiness]);

  // Facteurs de développement calculés
  const developmentFactors = useMemo(() => {
    const factors: number[] = [];
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      let sumPrev = 0;
      let count = 0;
      
      triangleData.forEach(row => {
        if (row.development[col] && row.development[col + 1]) {
          sum += row.development[col + 1];
          sumPrev += row.development[col];
          count++;
        }
      });
      
      if (count > 0) {
        factors.push(sum / sumPrev);
      }
    }
    return factors;
  }, [triangleData]);

  // Calcul des réserves par différentes méthodes
  const reserveEstimates: ReserveEstimate[] = useMemo(() => {
    const chainLadderEstimate = triangleData.reduce((total, row) => {
      const lastValue = row.development[row.development.length - 1];
      let projected = lastValue;
      
      for (let i = row.development.length - 1; i < developmentFactors.length; i++) {
        projected *= developmentFactors[i];
      }
      
      return total + (projected - lastValue);
    }, 0);

    const bfEstimate = chainLadderEstimate * 0.95;
    const capeCodEstimate = chainLadderEstimate * 0.92;

    return [
      {
        method: 'Chain Ladder',
        estimate: chainLadderEstimate,
        variance: chainLadderEstimate * 0.05,
        confidence95: [chainLadderEstimate * 0.9, chainLadderEstimate * 1.1]
      },
      {
        method: 'Bornhuetter-Ferguson',
        estimate: bfEstimate,
        variance: bfEstimate * 0.04,
        confidence95: [bfEstimate * 0.92, bfEstimate * 1.08]
      },
      {
        method: 'Cape Cod',
        estimate: capeCodEstimate,
        variance: capeCodEstimate * 0.06,
        confidence95: [capeCodEstimate * 0.88, capeCodEstimate * 1.12]
      }
    ];
  }, [triangleData, developmentFactors]);

  // Données de mortalité
  const mortalityData: MortalityData[] = useMemo(() => {
    const baseQx = mortalityTable === 'TF00-02' 
      ? [0.0004, 0.0003, 0.0002, 0.0002, 0.0003, 0.0004, 0.0005, 0.0007, 0.001, 0.0015]
      : [0.0005, 0.0004, 0.0003, 0.0003, 0.0004, 0.0005, 0.0006, 0.0008, 0.0012, 0.0018];
    
    let lx = 100000;
    const data: MortalityData[] = [];
    
    for (let age = 20; age <= 100; age += 5) {
      const index = Math.min(Math.floor((age - 20) / 8), baseQx.length - 1);
      const qx = baseQx[index] * Math.pow(1.1, (age - 20) / 10);
      const dx = Math.round(lx * qx);
      const ex = 85 - age * 0.7;
      
      data.push({ age, qx, lx, dx, ex });
      lx = lx - dx;
    }
    
    return data;
  }, [mortalityTable]);

  // Données pour le graphique de projection
  const projectionData = useMemo(() => {
    const years = [];
    for (let i = 0; i <= 10; i++) {
      years.push({
        year: 2024 + i,
        best: 4500000 * Math.pow(1.02, i),
        expected: 4500000 * Math.pow(1.05, i),
        worst: 4500000 * Math.pow(1.08, i)
      });
    }
    return years;
  }, []);

  // Helper pour le formatage des montants
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper pour le formatage des pourcentages
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(3)}%`;
  };

  // Fonction pour transformer les données du triangle pour l'affichage
  const getTriangleDisplayData = () => {
    return triangleData.map(row => {
      const displayRow: any = { year: row.year };
      row.development.forEach((value, index) => {
        displayRow[`dev${index}`] = value;
      });
      
      let lastValue = row.development[row.development.length - 1];
      for (let i = row.development.length; i < 5; i++) {
        if (developmentFactors[i - 1]) {
          lastValue = lastValue * developmentFactors[i - 1];
          displayRow[`dev${i}`] = Math.round(lastValue);
          displayRow[`isProjected${i}`] = true;
        }
      }
      
      return displayRow;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <Calculator className="h-8 w-8 text-violet-500" />
            Actuarial Analytics Module
          </h1>
          <p className="text-slate-400 mt-1">
            Réserves techniques, triangles de développement et tables de mortalité
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedLineOfBusiness}
            onChange={(e) => setSelectedLineOfBusiness(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg"
          >
            <option value="motor">Automobile</option>
            <option value="property">Dommages aux biens</option>
            <option value="liability">Responsabilité civile</option>
            <option value="health">Santé</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Analyses
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
          {['reserves', 'triangles', 'mortality', 'projections'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'reserves' && 'Réserves Techniques'}
              {tab === 'triangles' && 'Triangles de Développement'}
              {tab === 'mortality' && 'Tables de Mortalité'}
              {tab === 'projections' && 'Projections & Stress'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'reserves' && (
          <div className="space-y-4">
            {/* Résumé des estimations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {reserveEstimates.map((estimate) => (
                <Card key={estimate.method}>
                  <CardHeader>
                    <CardTitle>{estimate.method}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(estimate.estimate)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Estimation centrale
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Intervalle 95%</span>
                          <span className="font-medium text-white">
                            {formatCurrency(estimate.confidence95[0])} - {formatCurrency(estimate.confidence95[1])}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Coefficient de variation</span>
                          <span className="font-medium text-white">
                            {((estimate.variance / estimate.estimate) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparaison des méthodes */}
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des Méthodes d'Estimation</CardTitle>
                <CardDescription>
                  Analyse comparative des différentes approches actuarielles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reserveEstimates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="method" stroke="#94a3b8" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M€`} stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="estimate" fill="#3b82f6" />
                    <Bar dataKey="confidence95[0]" fill="#475569" />
                    <Bar dataKey="confidence95[1]" fill="#475569" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'triangles' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Triangle de Développement des Sinistres</CardTitle>
                <CardDescription>
                  Évolution des paiements cumulés par année de survenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 text-white">Année</th>
                        <th className="text-right py-2 text-white">12 mois</th>
                        <th className="text-right py-2 text-white">24 mois</th>
                        <th className="text-right py-2 text-white">36 mois</th>
                        <th className="text-right py-2 text-white">48 mois</th>
                        <th className="text-right py-2 text-white">60 mois</th>
                        <th className="text-right py-2 text-white">Ultimate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTriangleDisplayData().map((row) => (
                        <tr key={row.year} className="border-b border-slate-700">
                          <td className="py-2 font-medium text-white">{row.year}</td>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <td key={i} className={`text-right py-2 ${row[`isProjected${i}`] ? 'text-blue-500 italic' : 'text-slate-400'}`}>
                              {row[`dev${i}`] ? formatCurrency(row[`dev${i}`]) : '-'}
                            </td>
                          ))}
                          <td className="text-right py-2 font-semibold text-white">
                            {formatCurrency(row.dev4 || row.dev3 || row.dev2 || row.dev1 || row.dev0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Facteurs de Développement</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {developmentFactors.map((factor, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <p className="text-sm text-slate-400">
                          {12 * (index + 1)} → {12 * (index + 2)} mois
                        </p>
                        <p className="text-xl font-bold text-white">{factor.toFixed(3)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution des Paiements Cumulés</CardTitle>
                <CardDescription>
                  Courbes de développement par année de survenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="month" 
                      domain={[12, 60]}
                      ticks={[12, 24, 36, 48, 60]}
                      label={{ value: 'Mois de développement', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                      stroke="#94a3b8"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value / 1000000}M€`} 
                      stroke="#94a3b8"
                    />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                    {triangleData.slice(0, 4).map((yearData, index) => (
                      <Line
                        key={yearData.year}
                        type="monotone"
                        data={yearData.development.map((value, i) => ({
                          month: (i + 1) * 12,
                          value
                        }))}
                        dataKey="value"
                        name={`Année ${yearData.year}`}
                        stroke={['#3b82f6', '#8b5cf6', '#10b981', '#94a3b8'][index]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'mortality' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tables de Mortalité Réglementaires</CardTitle>
                <CardDescription>
                  Analyse des tables de mortalité pour l'assurance vie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <select
                    value={mortalityTable}
                    onChange={(e) => setMortalityTable(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  >
                    <option value="TF00-02">TF 00-02 (Femmes)</option>
                    <option value="TH00-02">TH 00-02 (Hommes)</option>
                    <option value="TPG93">TPG93</option>
                    <option value="TPRV">TPRV 1993</option>
                  </select>
                  <Badge variant="outline">
                    Table réglementaire France
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-white">Taux de Mortalité (qx)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mortalityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis 
                          dataKey="age" 
                          label={{ value: 'Âge', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          stroke="#94a3b8"
                        />
                        <YAxis 
                          tickFormatter={(value) => formatPercentage(value)} 
                          stroke="#94a3b8"
                        />
                        <Tooltip 
                          formatter={(value: any) => formatPercentage(value)}
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#94a3b8' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="qx" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Probabilité de décès"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-white">Espérance de Vie (ex)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mortalityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis 
                          dataKey="age" 
                          label={{ value: 'Âge', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#94a3b8' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="ex" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.3}
                          name="Espérance de vie (années)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-violet-500" />
                      <span className="text-sm font-medium text-slate-400">Espérance à 65 ans</span>
                    </div>
                    <p className="text-2xl font-bold text-white">22.3 ans</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartPulse className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-slate-400">Probabilité survie 85 ans</span>
                    </div>
                    <p className="text-2xl font-bold text-white">68.4%</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-400">Amélioration annuelle</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">1.2%</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-slate-400">Dernière mise à jour</span>
                    </div>
                    <p className="text-2xl font-bold text-white">2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'projections' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projections des Sinistres Future</CardTitle>
                <CardDescription>
                  Scénarios best estimate, optimiste et pessimiste
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-medium text-slate-400">Niveau de confiance</label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="range"
                      value={confidenceLevel}
                      onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                      min={80}
                      max={99}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-white">{confidenceLevel}%</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M€`} stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ color: '#ffffff' }} />
                    <Area
                      type="monotone"
                      dataKey="worst"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                      name="Scénario Pessimiste"
                    />
                    <Area
                      type="monotone"
                      dataKey="expected"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Best Estimate"
                    />
                    <Area
                      type="monotone"
                      dataKey="best"
                      stackId="3"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Scénario Optimiste"
                    />
                    <ReferenceLine y={5000000} stroke="#94a3b8" strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stress Tests Actuariels</CardTitle>
                  <CardDescription>Impact sur les réserves techniques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-400">Inflation +3%</span>
                        <Badge variant="destructive">+12.5%</Badge>
                      </div>
                      <div className="h-2 bg-slate-700 rounded">
                        <div className="h-2 bg-red-500 rounded" style={{ width: '75%' }} />
                      </div>
                    </div>
                    
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-400">Fréquence sinistres +10%</span>
                        <Badge variant="secondary">+8.2%</Badge>
                      </div>
                      <div className="h-2 bg-slate-700 rounded">
                        <div className="h-2 bg-slate-500 rounded" style={{ width: '55%' }} />
                      </div>
                    </div>
                    
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-400">Pandémie (mortalité x2)</span>
                        <Badge variant="destructive">+18.7%</Badge>
                      </div>
                      <div className="h-2 bg-slate-700 rounded">
                        <div className="h-2 bg-red-500 rounded" style={{ width: '90%' }} />
                      </div>
                    </div>
                    
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-400">Catastrophe naturelle</span>
                        <Badge variant="secondary">+5.8%</Badge>
                      </div>
                      <div className="h-2 bg-slate-700 rounded">
                        <div className="h-2 bg-slate-500 rounded" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations Actuarielles</CardTitle>
                  <CardDescription>Actions suggérées basées sur l'analyse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                      <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-white">Augmenter les réserves IBNR</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Les facteurs de développement montrent une tendance à la hausse
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                      <ChevronRight className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-white">Revoir la tarification RC Auto</p>
                        <p className="text-xs text-slate-400 mt-1">
                          La sinistralité dépasse les prévisions de 8%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                      <ChevronRight className="h-5 w-5 text-violet-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-white">Mettre à jour les tables de mortalité</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Les tables actuelles sous-estiment la longévité de 2.3%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                      <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-white">Renforcer la réassurance Cat</p>
                        <p className="text-xs text-slate-400 mt-1">
                          L'exposition aux catastrophes a augmenté de 15%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActuarialAnalytics;