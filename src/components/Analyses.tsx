import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';
import { useStore } from '../store'; // Import ajouté

// Interface supprimée (plus nécessaire)
// interface AnalysesProps {
//   isDarkMode: boolean;
// }

// Suppression de la props isDarkMode
// const Analyses: React.FC<AnalysesProps> = ({ isDarkMode }) => {
const Analyses: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore(); // Utilisation du store

  // Données pour le graphique trimestriel
  const quarterlyData = [
    { quarter: 'Q1', Revenus: 120000, Coûts: 80000, Profit: 40000 },
    { quarter: 'Q2', Revenus: 150000, Coûts: 90000, Profit: 60000 },
    { quarter: 'Q3', Revenus: 180000, Coûts: 100000, Profit: 80000 },
    { quarter: 'Q4', Revenus: 200000, Coûts: 110000, Profit: 90000 }
  ];

  // Données pour le radar (format transformé)
  const performanceData = [
    { metric: 'Efficacité', value: 85 },
    { metric: 'Productivité', value: 92 },
    { metric: 'Satisfaction', value: 78 },
    { metric: 'Innovation', value: 88 },
    { metric: 'Qualité', value: 95 }
  ];

  const radarData = performanceData.map(item => ({
    subject: item.metric,
    A: item.value,
    fullMark: 100
  }));

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`mb-6 inline-flex items-center text-sm transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analyses Avancées
          </h1>
          <p className={`mt-2 text-lg ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            ML & Prédictions
          </p>
        </div>

        {/* Charts Grid avec séparation et taille réduite */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Analyse Trimestrielle */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analyse Trimestrielle 2024
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quarterlyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  barGap={10}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={darkMode ? '#334155' : '#E5E7EB'} 
                  />
                  <XAxis 
                    dataKey="quarter" 
                    stroke={darkMode ? '#94a3b8' : '#6B7280'}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke={darkMode ? '#94a3b8' : '#6B7280'}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#FFFFFF',
                      border: darkMode ? '1px solid #334155' : '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: darkMode ? '#f1f5f9' : '#111827' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={12}
                  />
                  <Bar 
                    dataKey="Revenus" 
                    fill="#3b82f6" 
                    name="Revenus (€)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Coûts" 
                    fill="#ef4444" 
                    name="Coûts (€)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Profit" 
                    fill="#10b981" 
                    name="Profit (€)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Globale */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Globale
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  data={radarData} 
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid 
                    stroke={darkMode ? '#334155' : '#E5E7EB'}
                    gridType="polygon"
                  />
                  <PolarAngleAxis 
                    dataKey="subject"
                    stroke={darkMode ? '#94a3b8' : '#6B7280'}
                    tick={{ fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    stroke={darkMode ? '#94a3b8' : '#6B7280'}
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#FFFFFF',
                      border: darkMode ? '1px solid #334155' : '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: darkMode ? '#f1f5f9' : '#111827' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section supplémentaire pour plus de contenu */}
        <div className={`mt-8 p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          <div className="flex items-center mb-4">
            <Brain className={`h-6 w-6 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Insights ML
            </h3>
          </div>
          <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Les analyses prédictives indiquent une croissance continue pour le prochain trimestre avec une confiance de 87%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analyses;