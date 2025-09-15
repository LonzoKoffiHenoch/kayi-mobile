import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { SupportedLanguage } from '../types/common.types';
import { STORAGE_KEYS, CI_CONSTANTS } from '../config/constants';

// Ressources de traduction (exemple)
const resources = {
  fr: {
    translation: {
      // Auth
      'auth.welcome': 'Bienvenue',
      'auth.login': 'Connexion',
      'auth.register': 'Inscription',
      'auth.phone_placeholder': '+225 XX XX XX XX XX',
      'auth.password': 'Mot de passe',
      'auth.forgot_password': 'Mot de passe oublié ?',
      'auth.create_account': 'Créer un compte',
      
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.confirm': 'Confirmer',
      'common.save': 'Enregistrer',
      
      // Home
      'home.greeting': 'Bonjour 👋',
      'home.welcome_text': 'Trouvez votre logement idéal',
      'home.search_placeholder': 'Rechercher un logement...',
      'home.quick_actions': 'Actions rapides',
      'home.recent_properties': 'Propriétés récentes',
    },
  },
  en: {
    translation: {
      // Auth
      'auth.welcome': 'Welcome',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.phone_placeholder': '+225 XX XX XX XX XX',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot password?',
      'auth.create_account': 'Create account',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.save': 'Save',
      
      // Home
      'home.greeting': 'Hello 👋',
      'home.welcome_text': 'Find your ideal home',
      'home.search_placeholder': 'Search for housing...',
      'home.quick_actions': 'Quick actions',
      'home.recent_properties': 'Recent properties',
    },
  },
  baule: {
    translation: {
      // Traductions en Baoulé - À compléter avec un locuteur natif
      'auth.welcome': 'Akwaba',
      'auth.login': 'Kɔ ɔtra',
      'common.loading': 'Ɛ ka tra...',
      'common.error': 'Gbagbe',
    },
  },
  dioula: {
    translation: {
      // Traductions en Dioula - À compléter avec un locuteur natif
      'auth.welcome': 'I ni che',
      'auth.login': 'Don kɔ',
      'common.loading': 'A ka baara...',
      'common.error': 'Fili',
    },
  },
};

// Configuration i18next
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Langue par défaut
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  availableLanguages: typeof CI_CONSTANTS.SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await SecureStore.getItemAsync(STORAGE_KEYS.LANGUAGE);
      if (storedLanguage && isValidLanguage(storedLanguage)) {
        const language = storedLanguage as SupportedLanguage;
        setCurrentLanguage(language);
        i18next.changeLanguage(language);
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
    }
  };

  const isValidLanguage = (lang: string): boolean => {
    return CI_CONSTANTS.SUPPORTED_LANGUAGES.some(l => l.code === lang);
  };

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE, language);
      await i18next.changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    availableLanguages: CI_CONSTANTS.SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      <I18nextProvider i18n={i18next}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return context;
}