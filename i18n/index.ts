import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

export const resources = {
  en: {
    translation: {
      assignments: 'Assignments',
      myAssignments: 'My Assignments',
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
      task: 'Task',

      seasonalBanner: 'Seasonal Banner',
      on: 'On',
      off: 'Off',

      resetToMockTitle: 'Reset to mock data?',
      resetToMockMessage:
        'This will restore all mock shipments (including ones you deleted).',
      cancel: 'Cancel',
      reset: 'Reset',

      agendaFor: 'Agenda for {{date}}',
      addTask: 'Add Task',
      comingSoon: 'Coming soon.',
      noTasksForDate: 'No tasks for this date.',

      taskDetails: 'Task Details',
      openInMaps: 'Open in Maps',
      noLocationForTask: 'No location for this task',
      expected: 'Expected',
      break: 'Break',
      viewDetails: 'View Details',
      call: 'Call',
    },
  },
  ar: {
    translation: {
      assignments: 'المهام',
      myAssignments: 'مهامي',
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
      task: 'مهمة',

      seasonalBanner: 'لافتة موسمية',
      on: 'تشغيل',
      off: 'إيقاف',

      resetToMockTitle: 'إعادة التعيين إلى بيانات تجريبية؟',
      resetToMockMessage:
        'سيؤدي هذا إلى استعادة جميع الشحنات التجريبية (بما في ذلك التي حذفتها).',
      cancel: 'إلغاء',
      reset: 'إعادة تعيين',

      agendaFor: 'جدول أعمال {{date}}',
      addTask: 'إضافة مهمة',
      comingSoon: 'قريباً.',
      noTasksForDate: 'لا توجد مهام لهذا التاريخ.',

      taskDetails: 'تفاصيل المهمة',
      openInMaps: 'افتح في الخرائط',
      noLocationForTask: 'لا يوجد موقع لهذه المهمة',
      expected: 'متوقع',
      break: 'استراحة',
      viewDetails: 'عرض التفاصيل',
      call: 'اتصال',
    },
  },
} as const;

export function initI18n(defaultLng?: 'en' | 'ar') {
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
