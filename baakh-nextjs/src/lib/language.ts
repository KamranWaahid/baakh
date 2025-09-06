export interface LanguageConfig {
  name: string;
  direction: 'ltr' | 'rtl';
  fontClass: string;
  translations: {
    filter: string;
    search: string;
    searchPlaceholder: string;
    viewAll: string;
    poetry: string;
    noPoetryFound: string;
    loadingMore: string;
    featured: string;
    viewPoetry: string;
    readingTime: string;
    moreFiltersComing: string;
  };
}

export const getLanguageConfig = (locale: string): LanguageConfig => {
  const configs: Record<string, LanguageConfig> = {
    sd: {
      name: 'سنڌي',
      direction: 'rtl',
      fontClass: 'auto-sindhi-font',
      translations: {
        filter: 'فلٽر',
        search: 'ڳوليو',
        searchPlaceholder: 'شاعري ڳوليو...',
        viewAll: 'سڀ ڏسو',
        poetry: 'شاعري',
        noPoetryFound: 'هي صنف ۾ ڪا شاعري نٿي ملي',
        loadingMore: 'ٻي شاعري لوڊ ٿي رهي آهي...',
        featured: 'نموني',
        viewPoetry: 'شاعري ڏسو',
        readingTime: '2 منٽ',
        moreFiltersComing: 'ٻيا فلٽر جلد ايندا آهن (ٻولي، وقت، ٽيگ)...'
      }
    },
    en: {
      name: 'English',
      direction: 'ltr',
      fontClass: '',
      translations: {
        filter: 'Filter',
        search: 'Search',
        searchPlaceholder: 'Search within category…',
        viewAll: 'View All',
        poetry: 'Poetry',
        noPoetryFound: 'No poetry found in this category',
        loadingMore: 'Loading more…',
        featured: 'Featured',
        viewPoetry: 'View Poetry',
        readingTime: '2 min',
        moreFiltersComing: 'More filters coming soon (language, time period, tags)…'
      }
    },
    ur: {
      name: 'اردو',
      direction: 'rtl',
      fontClass: 'auto-urdu-font',
      translations: {
        filter: 'فلٹر',
        search: 'تلاش',
        searchPlaceholder: 'اس زمرے میں شاعری تلاش کریں...',
        viewAll: 'سب دیکھیں',
        poetry: 'شاعری',
        noPoetryFound: 'اس زمرے میں کوئی شاعری نہیں ملی',
        loadingMore: 'مزید لوڈ ہو رہا ہے...',
        featured: 'نمایاں',
        viewPoetry: 'شاعری دیکھیں',
        readingTime: '2 منٹ',
        moreFiltersComing: 'مزید فلٹرز جلد آ رہے ہیں (زبان، وقت، ٹیگز)...'
      }
    }
  };
  
  return configs[locale] || configs.en;
};
