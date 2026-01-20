import { useAppSelector } from '../redux/hooks';
import { darkTheme, lightTheme } from './themes';

export function useAppTheme() {
  const mode = useAppSelector(s => s.settings.theme);
  return mode === 'light' ? lightTheme : darkTheme;
}
