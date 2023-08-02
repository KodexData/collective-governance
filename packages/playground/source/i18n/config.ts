import LanguageDetector from 'i18next-browser-languagedetector'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import de from './de'
import fr from './fr'

export const resources = {
  en, de, fr,
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    //lng: 'en', // if you're using a language detector, do not define the lng option
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources,
    // lng: 'de'
  })
