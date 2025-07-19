import React from 'react';
import { useStore } from '../store';
import { Moon, Sun, Globe, Shield, Bell, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, selectedSector, setSelectedSector } = useStore();

  return (
    <div className={`p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Paramètres
      </h1>

      <div className="max-w-4xl space-y-6">
        {/* Apparence */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Sun className="h-5 w-5 mr-2" />
            Apparence
          </h2>
          <div className="flex items-center justify-between">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mode sombre</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Secteur */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="h-5 w-5 mr-2" />
            Secteur par défaut
          </h2>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as 'banking' | 'insurance')}
            className={`w-full p-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="banking">Banking</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>

        {/* Sécurité */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="h-5 w-5 mr-2" />
            Sécurité
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Authentification à deux facteurs</span>
              <button className="text-indigo-600 hover:text-indigo-700">Configurer</button>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sessions actives</span>
              <button className="text-indigo-600 hover:text-indigo-700">Gérer</button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alertes de seuils critiques</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rapports hebdomadaires</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mises à jour système</span>
            </label>
          </div>
        </div>

        {/* Données */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Database className="h-5 w-5 mr-2" />
            Données & Confidentialité
          </h2>
          <div className="space-y-3">
            <button className="text-indigo-600 hover:text-indigo-700">Exporter mes données</button>
            <button className="text-red-600 hover:text-red-700 block">Supprimer mon compte</button>
          </div>
        </div>
      </div>
    </div>
  );
};