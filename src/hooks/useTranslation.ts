// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\hooks\useTranslation.ts

import { useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { translations, Language } from '../i18n/translations';

// Types pour l'interpolation
type InterpolationValues = Record<string, string | number>;

// Hook de traduction optimisé
export const useTranslation = () => {
  const { language } = useStore();
  
  // Mémoization du contexte de langue pour éviter les recalculs
  const currentTranslations = useMemo(
    () => translations[language as Language] || translations.fr,
    [language]
  );

  // Fonction de traduction mémorisée
  const t = useCallback((
    path: string,
    defaultValue?: string,
    interpolations?: InterpolationValues
  ): string => {
    // Fonction helper pour naviguer dans l'objet
    const getNestedValue = (obj: any, keys: string[]): any => {
      return keys.reduce((current, key) => {
        if (current && typeof current === 'object' && key in current) {
          return current[key];
        }
        return undefined;
      }, obj);
    };

    const keys = path.split('.');
    
    // Chercher d'abord dans la langue actuelle
    let value = getNestedValue(currentTranslations, keys);
    
    // Si non trouvé et langue différente du français, chercher en français
    if (value === undefined && language !== 'fr') {
      value = getNestedValue(translations.fr, keys);
    }
    
    // Utiliser la valeur par défaut ou le path si rien n'est trouvé
    if (value === undefined || typeof value !== 'string') {
      value = defaultValue || path;
    }
    
    // Interpolation des variables si nécessaire
    if (interpolations && typeof value === 'string') {
      return Object.entries(interpolations).reduce((result, [key, val]) => {
        return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  }, [currentTranslations, language]);

  // Fonction pour obtenir toutes les traductions d'un namespace
  const tNamespace = useCallback((namespace: string): Record<string, string> => {
    const keys = namespace.split('.');
    const value = keys.reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return current[key];
      }
      return undefined;
    }, currentTranslations);
    
    return typeof value === 'object' ? value : {};
  }, [currentTranslations]);

  // Fonction pour vérifier si une traduction existe
  const hasTranslation = useCallback((path: string): boolean => {
    const keys = path.split('.');
    const value = keys.reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return current[key];
      }
      return undefined;
    }, currentTranslations);
    
    return value !== undefined && typeof value === 'string';
  }, [currentTranslations]);

  // Fonction pour obtenir la langue actuelle formatée
  const getLanguageLabel = useCallback((): string => {
    const labels: Record<Language, string> = {
      fr: 'Français',
      en: 'English'
    };
    return labels[language as Language] || 'Français';
  }, [language]);

  return { 
    t, 
    tNamespace,
    hasTranslation,
    language,
    getLanguageLabel
  };
};

// Export des types pour utilisation externe
export type TranslationFunction = ReturnType<typeof useTranslation>['t'];
export type { InterpolationValues };