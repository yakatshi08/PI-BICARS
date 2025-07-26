// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\Header.tsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, Moon, Sun, Globe, Brain, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode: toggleTheme, language, setLanguage } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
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

  const activeModule = location.pathname.split('/')[1];

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
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} hidden sm:block whitespace-nowrap`}>
                Plateforme Intelligence Finance & Assurance
              </p>
            </div>
          </Link>

          {/* Navigation principale */}
          <div className="flex items-center space-x-2">
            {/* Bouton Tous */}
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tous
            </button>

            {/* Bouton Bancaire */}
            <button
              onClick={() => navigate('/banking')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeModule === 'banking'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Bancaire
            </button>

            {/* Bouton Assurance */}
            <button
              onClick={() => navigate('/insurance/dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeModule === 'insurance'
                  ? 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Assurance
            </button>

            {/* Bouton ML & IA - CORRIGÉ */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                location.pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ML & IA
            </button>

            {/* Bouton Co-Pilot - Padding réduit */}
            <button
              onClick={() => navigate('/copilot')}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2 group relative"
              title="Assistant IA pour l'analyse, les recommandations et la prédiction ML"
            >
              <Brain className="h-5 w-5" />
              <span>Co-Pilot</span>
              {/* Infobulle */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                Assistant IA pour l'analyse, les recommandations et la prédiction ML
              </div>
            </button>
          </div>

          {/* Section des icônes à droite */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg relative hover:bg-gray-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
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
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-300" />
            </button>

            {/* Thème - Avec infobulle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors group relative"
              title={darkMode ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Langue - Corrigé pour FR */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Globe className="h-5 w-5 text-gray-300" />
                <span className="text-sm text-gray-300">
                  {languages.find(l => l.code === language)?.label || 'FR'}
                </span>
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