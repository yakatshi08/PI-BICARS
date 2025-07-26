import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, Area, AreaChart, Legend
} from 'recharts';
import { useStore } from '../store';
import { ArrowUp, ArrowDown, Star, Database, Zap, BarChart2, Activity, ChevronDown, GitBranch, Cpu, TrendingUp, LineChart } from 'lucide-react';

const Dashboard = () => {
  const { darkMode } = useStore();
  
  // Liste des modèles avec structure complète
  const mlModels = [
    {
      id: 'xgboost',
      name: 'XGBoost',
      description: 'Gradient Boosting optimisé pour le scoring crédit et la détection de fraude',
      accuracy: '94%',
      speed: 'Très rapide',
      useCases: ['Credit Scoring', 'Fraud Detection', 'Churn Prediction'],
      icon: GitBranch,
      color: 'blue'
    },
    {
      id: 'lstm',
      name: 'LSTM Networks',
      description: 'Réseaux de neurones pour séries temporelles et prédictions complexes',
      accuracy: '92%',
      speed: 'Modéré',
      useCases: ['Time Series', 'Market Prediction', 'Anomaly Detection'],
      icon: Cpu,
      color: 'purple'
    },
    {
      id: 'prophet',
      name: 'Prophet',
      description: 'Modèle Facebook pour prévisions avec saisonnalité et tendances',
      accuracy: '88%',
      speed: 'Rapide',
      useCases: ['Demand Forecasting', 'Revenue Prediction', 'Trend Analysis'],
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'arima',
      name: 'ARIMA',
      description: 'Modèle statistique classique pour séries temporelles',
      accuracy: '82%',
      speed: 'Très rapide',
      useCases: ['Economic Forecasting', 'Risk Metrics', 'Portfolio Analysis'],
      icon: LineChart,
      color: 'orange'
    },
    {
      id: 'cox',
      name: 'Cox Models',
      description: 'Modèles de survie pour analyse de durée et risque',
      accuracy: '86%',
      speed: 'Rapide',
      useCases: ['Default Prediction', 'Customer Lifetime', 'Insurance Claims'],
      icon: Activity,
      color: 'red'
    }
  ];

  // Données pour le graphique radar
  const modelPerformance = [
    { model: 'XGBoost', accuracy: 94, speed: 90, interpretability: 70 },
    { model: 'LSTM', accuracy: 92, speed: 60, interpretability: 40 },
    { model: 'Prophet', accuracy: 88, speed: 85, interpretability: 80 },
    { model: 'ARIMA', accuracy: 82, speed: 95, interpretability: 90 },
    { model: 'Cox', accuracy: 86, speed: 75, interpretability: 85 },
  ];

  // Données pour le graphique à barres
  const modelUsageData = [
    { name: 'XGBoost', usage: 42, color: '#3b82f6' },
    { name: 'LSTM', usage: 28, color: '#8b5cf6' },
    { name: 'Prophet', usage: 35, color: '#10b981' },
    { name: 'ARIMA', usage: 22, color: '#f59e0b' },
    { name: 'Cox', usage: 18, color: '#ef4444' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du dashboard */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord des modèles ML</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Analyse comparative des performances et utilisation des modèles
          </p>
        </div>

        {/* Section des indicateurs clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Database, title: 'Modèles actifs', value: '12', color: 'blue', trend: '+3' },
            { icon: BarChart2, title: 'Précision moyenne', value: '89.2%', color: 'purple', trend: '+1.5%' },
            { icon: Zap, title: 'Latence moyenne', value: '128ms', color: 'green', trend: '-22ms', negative: true },
            { icon: Star, title: 'Modèle favori', value: 'XGBoost', color: 'yellow', subtext: '42% utilisation' }
          ].map((item, index) => (
            <div key={index} className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 bg-${item.color}-500/10`}>
                  <item.icon className={`text-${item.color}-500`} size={20} />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.title}</p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                </div>
              </div>
              {item.trend ? (
                <div className="flex items-center mt-3">
                  {item.negative ? (
                    <ArrowDown className="text-red-500" size={16} />
                  ) : (
                    <ArrowUp className="text-green-500" size={16} />
                  )}
                  <span className={`text-sm ml-1 ${item.negative ? 'text-red-500' : 'text-green-500'}`}>
                    {item.trend}
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.subtext}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section des graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Liste des modèles */}
          <div className="space-y-4">
            {mlModels.map((model, index) => {
              const Icon = model.icon;
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'} transition-all hover:scale-[1.02] flex items-start`}
                >
                  <div className={`p-3 rounded-lg mr-4 bg-${model.color}-500/10`}>
                    <Icon className={`text-${model.color}-500`} size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {model.name}
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {model.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {model.useCases.map((useCase, i) => (
                        <span 
                          key={i} 
                          className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Précision:</span>
                        <span className="font-medium ml-2">{model.accuracy}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vitesse:</span>
                        <span className="font-medium ml-2">{model.speed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphique de performance avec corrections définitives */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparaison des Performances des Modèles ML
              <span className={`text-sm font-normal block mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                (Précision, Vitesse, Interprétabilité)
              </span>
            </h3>
            
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart 
                data={modelPerformance} 
                margin={{ top: 80, right: 50, bottom: 40, left: 50 }}
                cx="50%" 
                cy="50%"
              >
                <PolarGrid 
                  stroke={darkMode ? '#475569' : '#e5e7eb'} 
                  strokeDasharray="3 3"
                />
                
                <PolarAngleAxis 
                  dataKey="model" 
                  stroke={darkMode ? '#f1f1f1' : '#374151'}
                  tick={{ 
                    fontSize: 13,
                    fill: darkMode ? '#f1f1f1' : '#374151',
                    fontWeight: 600
                  }}
                  tickMargin={25}
                  radius={150}
                />
                
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  stroke={darkMode ? '#f1f1f1' : '#6b7280'}
                  tick={{ 
                    fontSize: 14,
                    fill: darkMode ? '#f1f1f1' : '#374151',
                    fontWeight: 700,
                    dx: -15,
                    dy: 3
                  }}
                  tickCount={5}
                  tickFormatter={(value) => `${value}%`}
                />
                
                <Radar 
                  name="Précision" 
                  dataKey="accuracy" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                  dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                />
                <Radar 
                  name="Vitesse" 
                  dataKey="speed" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
                <Radar 
                  name="Interprétabilité" 
                  dataKey="interpretability" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
                
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1e293b' : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? '#475569' : '#e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`${value}/100`, name]}
                  labelStyle={{
                    color: darkMode ? '#e2e8f0' : '#374151',
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}
                />
                
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="rect"
                  iconSize={12}
                  wrapperStyle={{
                    paddingTop: '30px',
                    fontSize: '14px'
                  }}
                  formatter={(value) => (
                    <span style={{ 
                      color: darkMode ? '#e2e8f0' : '#374151',
                      marginLeft: '4px'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Précision
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Vitesse
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Interprétabilité
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard };