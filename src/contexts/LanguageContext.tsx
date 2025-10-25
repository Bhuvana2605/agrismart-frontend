import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { te } from '../locales/te';
import { hi } from '../locales/hi';

type Language = 'en' | 'te' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
}

const translations: Record<Language, Record<string, string>> = {
  en,
  te,
  hi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
      setLanguageState(saved as Language);
      console.log('🌐 Loaded saved language:', saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    console.log('🌐 Language changed to:', lang);
  };

  // Translation function for static text
  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  // Function to translate dynamic text using backend API
  const translateText = async (text: string, targetLang?: Language): Promise<string> => {
    const lang = targetLang || language;
    
    console.log(`🔤 translateText called: "${text}" → ${lang}`);
    
    // Don't translate if already in English or empty
    if (lang === 'en' || !text || text.trim() === '') {
      console.log('⏭️ Skipping translation (English or empty)');
      return text;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agrismart-backend-35jd.onrender.com';
      console.log('🌐 Calling translation API:', `${API_BASE_URL}/api/translate`);
      
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          target_language: lang
        })
      });
      
      console.log('📡 Translation API response status:', response.status);
      
      if (!response.ok) {
        console.warn('❌ Translation API failed, using original text');
        return text;
      }
      
      const data = await response.json();
      console.log('✅ Translation result:', data);
      console.log(`   "${text}" → "${data.translated_text}"`);
      
      return data.translated_text || text;
    } catch (error) {
      console.error('❌ Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
