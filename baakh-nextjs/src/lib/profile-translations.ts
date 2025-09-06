export interface ProfileTranslations {
  back: string;
  profile: string;
  welcomeBack: string;
  email: string;
  memberSince: string;
  personalInformation: string;
  username: string;
  sindhiName: string;
  userId: string;
  accountType: string;
  standard: string;
  activity: string;
  likes: string;
  bookmarks: string;
  profileViews: string;
  quickActions: string;
  settings: string;
  editProfile: string;
  logout: string;
  accountActive: string;
  e2eeActive: string;
}

export const getProfileTranslations = (language: 'en' | 'sd'): ProfileTranslations => {
  const translations: Record<'en' | 'sd', ProfileTranslations> = {
    en: {
      back: 'Back',
      profile: 'Profile',
      welcomeBack: 'Welcome back',
      email: 'Email',
      memberSince: 'Member since',
      personalInformation: 'Personal Information',
      username: 'Username',
      sindhiName: 'Sindhi Name',
      userId: 'User ID',
      accountType: 'Account Type',
      standard: 'Standard',
      activity: 'Activity',
      likes: 'Likes',
      bookmarks: 'Bookmarks',
      profileViews: 'Profile Views',
      quickActions: 'Quick Actions',
      settings: 'Settings',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      accountActive: 'Account Active',
      e2eeActive: 'Your End-to-End Encryption is active'
    },
    sd: {
      back: 'واپس',
      profile: 'پروفائل',
      welcomeBack: 'خوش آمديد',
      email: 'اي ميل',
      memberSince: 'رڪن',
      personalInformation: 'ذاتي معلومات',
      username: 'صارف نالو',
      sindhiName: 'سنڌي نالو',
      userId: 'صارف آئي ڊي',
      accountType: 'حساب جو قسم',
      standard: 'معياري',
      activity: 'سرگرمي',
      likes: 'پسند',
      bookmarks: 'نشانيون',
      profileViews: 'پروفائل',
      quickActions: 'جلدي عمل',
      settings: 'ترتيبات',
      editProfile: 'پروفائل ترميم',
      logout: 'لاگ آئوٽ',
      accountActive: 'حساب فعال',
      e2eeActive: 'آپ جو اينڊ ٽو اينڊ انڪرپشن فعال آهي'
    }
  };

  return translations[language];
};
