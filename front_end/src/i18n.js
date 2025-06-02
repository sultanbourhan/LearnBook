// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ملفات الترجمة
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationCA from './locales/ca/translation.json';

i18n
  .use(LanguageDetector) // يكتشف لغة المتصفح
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      es: { translation: translationES },
      ca: { translation: translationCA },
    },
    fallbackLng: 'en', // لغة افتراضية
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
