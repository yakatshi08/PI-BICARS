import React from 'react';
import { 
  Shield, Calculator, FileCheck, Activity,
  TrendingUp, AlertTriangle, PieChart as PieChartIcon, 
  ArrowUp, ArrowDown, Info, ArrowLeft, FileText
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const InsuranceCore: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();

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
        </div>
      </div>
    </div>
  );
};
