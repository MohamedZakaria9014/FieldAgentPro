export type ThemeMode = 'dark' | 'light';

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surface2: string;
    text: string;
    textMuted: string;
    primary: string;
    danger: string;
    border: string;
    pill: string;
    tabBar: string;
  };
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#0F1720',
    surface: '#16212B',
    surface2: '#1B2833',
    text: '#EAF2FF',
    textMuted: '#9AA9B8',
    primary: '#2196F3',
    danger: '#E53935',
    border: '#233241',
    pill: 'rgba(33, 150, 243, 0.15)',
    tabBar: '#121B22',
  },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F7FAFC',
    surface: '#FFFFFF',
    surface2: '#F1F5F9',
    text: '#0F1720',
    textMuted: '#5B6B7B',
    primary: '#1E88E5',
    danger: '#E53935',
    border: '#E2E8F0',
    pill: 'rgba(30, 136, 229, 0.12)',
    tabBar: '#FFFFFF',
  },
};
