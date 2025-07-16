// Composant de debug pour vérifier que i18n fonctionne correctement
// À utiliser temporairement pour diagnostiquer les problèmes

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../providers/I18nProvider';

const I18nDebug: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useI18n();

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold text-yellow-400 mb-2">🐛 Debug i18n</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-400">Langue actuelle:</span>{' '}
          <span className="text-green-400">{currentLanguage}</span>
        </div>
        
        <div>
          <span className="text-slate-400">i18n.language:</span>{' '}
          <span className="text-green-400">{i18n.language}</span>
        </div>
        
        <div>
          <span className="text-slate-400">localStorage:</span>{' '}
          <span className="text-green-400">
            {localStorage.getItem('preferredLanguage') || 'non défini'}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400">Test traduction:</span>{' '}
          <span className="text-blue-400">{t('common.loading')}</span>
        </div>
        
        <div className="pt-2 border-t border-slate-700">
          <p className="text-slate-400 mb-1">Changer de langue:</p>
          <div className="flex gap-2">
            {availableLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-2 py-1 rounded text-xs ${
                  currentLanguage === lang.code 
                    ? 'bg-indigo-600' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {lang.flag} {lang.code}
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-2 text-xs text-slate-500">
          Retirez ce composant en production !
        </div>
      </div>
    </div>
  );
};

export default I18nDebug;