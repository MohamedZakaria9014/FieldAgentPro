import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

export const resources = {
  en: {
    translation: {
      assignments: 'Assignments',
      schedule: 'Schedule',
      settings: 'Settings',
      seasonalRush: 'Seasonal Rush',
      highTraffic: 'High traffic expected in downtown zones.',
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      callCustomer: 'Call Customer',
      navigate: 'Navigate',
      notes: 'Notes',
      address: 'Address',
      company: 'Company',
      language: 'Language',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      manualSync: 'Manual Sync',
      arabic: 'Arabic',
      english: 'English',
    },
  },
  ar: {
    translation: {
      assignments: 'المهام',
      schedule: 'الجدول',
      settings: 'الإعدادات',
      seasonalRush: 'ذروة موسمية',
      highTraffic: 'ازدحام متوقع في مناطق وسط المدينة.',
      active: 'نشط',
      pending: 'معلق',
      completed: 'مكتمل',
      callCustomer: 'اتصل بالعميل',
      navigate: 'اذهب للموقع',
      notes: 'ملاحظات',
      address: 'العنوان',
      company: 'الشركة',
      language: 'اللغة',
      theme: 'المظهر',
      dark: 'داكن',
      light: 'فاتح',
      manualSync: 'مزامنة يدوية',
      arabic: 'العربية',
      english: 'الإنجليزية',
    },
  },
} as const;

export function initI18n(defaultLng: 'en' | 'ar' = 'en') {
  const locales = RNLocalize.getLocales();
  const deviceLng = locales[0]?.languageCode === 'ar' ? 'ar' : 'en';

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: defaultLng ?? deviceLng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
  }

  return i18n;
}

export default i18n;
