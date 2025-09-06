import { useLanguage } from "@/contexts/LanguageContext";

export function useCurrentLanguage() {
  const { language } = useLanguage();
  
  const addLanguageToUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}lang=${language}`;
  };
  
  const getLanguageParam = () => `?lang=${language}`;
  
  return {
    language,
    addLanguageToUrl,
    getLanguageParam
  };
}
