import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import sw from './locales/sw.json';
import zu from './locales/zu.json';
import ha from './locales/ha.json';
import am from './locales/am.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
  zu: { translation: zu },
  ha: { translation: ha },
  am: { translation: am },
  fr: { translation: fr },
  pt: { translation: pt }
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback('en');
      }
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
