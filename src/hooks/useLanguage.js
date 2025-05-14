import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../constants/config';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lng);
  }, [i18n]);

  const getCurrentLanguage = useCallback(() => {
    return LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];
  }, [i18n.language]);

  const getAvailableLanguages = useCallback(() => {
    return LANGUAGES;
  }, []);

  return {
    currentLanguage: getCurrentLanguage(),
    availableLanguages: getAvailableLanguages(),
    changeLanguage,
    isRTL: i18n.language === 'ar'
  };
}; 