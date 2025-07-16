// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\Header.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Moon, Sun, Globe, Brain, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

export const Header: React.FC = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode, language, setLanguage } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Nouvelle mise à jour disponible', time: 'Il y a 5 min' },
    { id: 2, text: 'Rapport mensuel généré', time: 'Il y a 1 heure' },
    { id: 3, text: 'Analyse terminée avec succès', time: 'Il y a 2 heures' },
  ];

  const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
  ];

  return (
    <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 transition-colors duration-200`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-2 shadow-lg">
              <span className="text-xl font-bold">PI</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                PI BICARS
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} hidden sm:block whitespace-nowrap`}>
                Plateforme Intelligence Finance & Assurance
              </p>
            </div>
          </Link>

          {/* Navigation centrale avec espacement optimisé */}
          <nav className="flex items-center gap-4 lg:gap-6 mx-auto">
            <Link
              to="/"
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all
                ${location.pathname === '/'
                  ? darkMode 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-blue-600 text-white shadow-md'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Tous
            </Link>

            <Link
              to="/banking"
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all
                ${location.pathname.includes('/banking')
                  ? darkMode 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-green-600 text-white shadow-md'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Bancaire
            </Link>

            <Link
              to="/insurance"
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all
                ${location.pathname.includes('/insurance')
                  ? darkMode 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-indigo-600 text-white shadow-md'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Assurance
            </Link>

            {/* Co-Pilot avec style amélioré */}
            <Link
              to="/copilot"
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap
                ${location.pathname === '/copilot'
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg transform scale-105'
                  : darkMode
                    ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105 border border-purple-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:scale-105'
                }`}
            >
              <Brain className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">Co-Pilot</span>
            </Link>
          </nav>

          {/* Actions utilisateur simplifiées */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100'}`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-64 sm:w-80 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer transition-colors`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {notif.text}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Paramètres */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100'}`}
              aria-label="Paramètres"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Mode sombre */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Basculer le mode sombre"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Sélecteur de langue amélioré */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${darkMode 
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {languages.find(l => l.code === language)?.label || 'FR'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showLanguageMenu && (
                <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors
                        ${language === lang.code
                          ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                          : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};