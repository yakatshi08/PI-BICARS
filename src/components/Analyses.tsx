import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';

interface AnalysesProps {
  isDarkMode: boolean;
}

const Analyses: React.FC<AnalysesProps> = ({ isDarkMode }) => {
  // Données pour le graphique trimestriel
  const quarterlyData = [
    { quarter: 'Q1', Revenus: 120000, Coûts: 80000, Profit: 40000 },
    { quarter: 'Q2', Revenus: 150000, Coûts: 90000, Profit: 60000 },
    { quarter: 'Q3', Revenus: 180000, Coûts: 100000, Profit: 80000 },
    { quarter: 'Q4', Revenus: 200000, Coûts: 110000, Profit: 90000 }
  ];

  // Données pour le radar
  const radarData = [
    { subject: 'Efficacité', A: 85, fullMark: 100 },
    { subject: 'Productivité', A: 78, fullMark: 100 },
    { subject: 'Qualité', A: 92, fullMark: 100 },
    { subject: 'Innovation', A: 88, fullMark: 100 },
    { subject: 'Satisfaction', A: 95, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Analyses
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Analyse Trimestrielle 2024 - VERSION AMÉLIORÉE */}
        <div className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Analyse Trimestrielle 2024
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={quarterlyData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              barGap={10}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="quarter"
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={14}
                tick={{ fontSize: 14 }}
              />
              <YAxis
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000'
                }}
              />
              <Legend />
              <Bar
                dataKey="Revenus"
                fill="#3b82f6"
                name="Revenus (€)"
                label={{
                  position: 'top',
                  fill: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: 11,
                  formatter: (value: number) => `€${value.toLocaleString()}`
                }}
              />
              <Bar
                dataKey="Coûts"
                fill="#ef4444"
                name="Coûts (€)"
                label={{
                  position: 'top',
                  fill: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: 11,
                  formatter: (value: number) => `€${value.toLocaleString()}`
                }}
              />
              <Bar
                dataKey="Profit"
                fill="#10b981"
                name="Profit (€)"
                label={{
                  position: 'top',
                  fill: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: 11,
                  formatter: (value: number) => `€${value.toLocaleString()}`
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique 2 : Performance Globale - RADAR AMÉLIORÉ */}
        <div className={`p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Performance Globale
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart
              data={radarData}
              margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
            >
              <PolarGrid
                stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
                strokeWidth={1.5}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontSize: 12
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontSize: 10
                }}
                tickCount={5}
              />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                label={{
                  position: 'outside',
                  fill: isDarkMode ? '#ffffff' : '#000000',
                  fontSize: 12,
                  formatter: (value: number) => value
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// EXPORT PAR DÉFAUT - OBLIGATOIRE !
export default Analyses;