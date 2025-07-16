import React from 'react';
import { BarChart3, ChevronDown, Moon, Sun, User } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSelector } from './LanguageSelector';

export const PIBicarsHeader: React.FC = () => {
  const { 
    darkMode, 
    toggleDarkMode, 
    selectedProfile, 
    setSelectedProfile,
    selectedSector,
    setSelectedSector 
  } = useStore();
  
  const { t } = useTranslation();

  const profiles = [
    { id: 'banker', label: t('profiles.banker'), icon: '🏦' },
    { id: 'actuary', label: t('profiles.actuary'), icon: '📊' },
    { id: 'risk-manager', label: t('profiles.riskManager'), icon: '⚠️' },
    { id: 'cfo', label: t('profiles.cfo'), icon: '💼' }
  ];

  const sectors = [
    { id: 'all', label: t('sectors.all'), color: 'bg-gray-600' },
    { id: 'banking', label: t('sectors.banking'), color: 'bg-blue-600' },
    { id: 'insurance', label: t('sectors.insurance'), color: 'bg-purple-600' }
  ];

  return (
    <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} 
                      border-b sticky top-0 z-50 backdrop-blur-xl bg-opacity-90`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo et Nom */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('appName')}
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('appDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Centre - Sélecteur de Secteur */}
          <div className="flex items-center space-x-2">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${selectedSector === sector.id
                    ? `${sector.color} text-white shadow-lg`
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {sector.label}
              </button>
            ))}
          </div>

          {/* Droite - Profil et Actions */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de Langue */}
            <LanguageSelector />
            
            {/* Sélecteur de Profil */}
            <div className="relative group">
              <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg
                ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
                <User className="h-5 w-5" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profiles.find(p => p.id === selectedProfile)?.label || t('profiles.banker')}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {/* Dropdown Profils */}
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg 
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                border opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                transition-all duration-200`}>
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                      ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}
                      ${selectedProfile === profile.id ? 'font-semibold' : ''}`}
                  >
                    <span>{profile.icon}</span>
                    <span>{profile.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors
                ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};