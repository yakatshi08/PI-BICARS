import React from 'react';
import { 
  Shield, Calculator, FileCheck, Activity,
  TrendingUp, AlertTriangle, PieChart as PieChartIcon, 
  ArrowUp, ArrowDown, Info, ArrowLeft, FileText
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const InsuranceCore: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();

  // Données pour les mini-graphiques
  const scrData = [
    { month: 'Mar', value: 182 },
    { month: 'Avr', value: 183 },
    { month: 'Mai', value: 188 },
    { month: 'Jun', value: 185 }
  ];

  const combinedRatioData = [
    { month: 'Mar', value: 94 },
    { month: 'Avr', value: 94 },
    { month: 'Mai', value: 94 },
    { month: 'Jun', value: 94.2 }
  ];

  const lossRatioData = [
    { name: 'Auto', value: 35, color: '#3b82f6' },
    { name: 'Habitation', value: 20, color: '#10b981' },
    { name: 'Santé', value: 30, color: '#8b5cf6' },
    { name: 'Autres', value: 15, color: '#f59e0b' }
  ];

  return (
    <div className={`p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className={`mr-4 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Shield className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-3xl font-bold">Insurance Core Module</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SCR Coverage */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">SCR Coverage</h3>
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">185%</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Well above regulatory minimum
          </p>
          
          {/* Ajout du graphique */}
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scrData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Combined Ratio */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Combined Ratio</h3>
            <Calculator className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">94.2%</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Profitable underwriting
          </p>
          
          {/* Ajout du graphique */}
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedRatioData}>
                <defs>
                  <linearGradient id="colorCombined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="url(#colorCombined)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Loss Ratio */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Loss Ratio</h3>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold">62.5%</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Claims to premiums ratio
          </p>
          
          {/* Ajout du graphique */}
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lossRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {lossRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};