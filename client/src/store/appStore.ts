import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
  currentLang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLang: 'ar',
  setLang: (lang) => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
    set({ currentLang: lang });
  }
}));
