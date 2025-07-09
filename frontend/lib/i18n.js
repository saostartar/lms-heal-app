import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../locales/en/common.json';
import id from '../locales/id/common.json';

const resources = {
  en: {
    common: en,
  },
  id: {
    common: id,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    ns: ['common'],
    defaultNS: 'common',
  });

export default i18n;