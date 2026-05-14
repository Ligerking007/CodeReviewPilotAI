import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppColors, buildTheme } from './theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  cycleMode: () => Promise<void>;
};

const THEME_KEY = 'codereviewpilot.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'system' || stored === 'light' || stored === 'dark') {
        setModeState(stored);
      }
    });
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = buildTheme(isDark);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      isDark,
      mode,
      async setMode(nextMode) {
        setModeState(nextMode);
        await AsyncStorage.setItem(THEME_KEY, nextMode);
      },
      async cycleMode() {
        const nextMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
        setModeState(nextMode);
        await AsyncStorage.setItem(THEME_KEY, nextMode);
      }
    }),
    [colors, isDark, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }
  return context;
}
