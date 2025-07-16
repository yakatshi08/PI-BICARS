import React, { ReactNode } from 'react';
import { useApiData } from '../hooks/useApiData';
import { useFinanceStore } from '../store';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DataProviderProps {
  children: ReactNode;
}

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isLoading, error, refresh } = useApiData();
  const { isDarkMode } = useFinanceStore();

  // Afficher un loader pendant le chargement initial
  if (isLoading && !error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className={`max-w-md p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Erreur de connexion
            </h3>
          </div>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {error}
          </p>
          <button
            onClick={refresh}
            className={`flex items-center justify-center w-full px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Afficher les enfants si tout va bien
  return <>{children}</>;
};

export default DataProvider;