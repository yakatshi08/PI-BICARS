import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <button 
        className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.label}</span>
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`
              flex items-center gap-3 w-full text-left px-4 py-3 
              hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg
              ${i18n.language === lang.code ? 'text-white bg-slate-700' : 'text-slate-400'}
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.label}</span>
            {i18n.language === lang.code && (
              <svg className="w-4 h-4 ml-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;