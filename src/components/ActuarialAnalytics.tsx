// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\ActuarialAnalytics.tsx

import React from 'react';
import { useStore } from '../store';
import { Calculator, TrendingUp, Activity } from 'lucide-react';

const ActuarialAnalytics: React.FC = () => {
  const { darkMode } = useStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`px-6 pt-6 pb-4 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Actuarial Analytics
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Triangles de développement, projections et analyses actuarielles
        </p>
      </div>
      <div className="p-6">
        <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <p>Module Actuariat - À développer</p>
        </div>
      </div>
    </div>
  );
};

export default ActuarialAnalytics;