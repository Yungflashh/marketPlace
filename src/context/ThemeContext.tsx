import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Preference = Theme | 'system';

interface ThemeContextValue {
  theme: Theme;
  preference: Preference;
  setPreference: (p: Preference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'shoplogs.theme.v1';

const getSystemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const readStoredPreference = (): Preference => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch { /* ignore */ }
  return 'system';
};

const applyThemeClass = (t: Theme) => {
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<Preference>(() => readStoredPreference());
  const [theme, setTheme] = useState<Theme>(() => {
    const pref = readStoredPreference();
    return pref === 'system' ? getSystemTheme() : pref;
  });

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setPreference = (p: Preference): void => {
    setPreferenceState(p);
    try { localStorage.setItem(STORAGE_KEY, p); } catch { /* ignore */ }
    setTheme(p === 'system' ? getSystemTheme() : p);
  };

  const toggle = (): void => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
