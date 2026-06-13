/**
 * ThemeContext
 * Provides global theme state (dark / light) and a toggle function.
 * The theme value is persisted in localStorage under the key 'app_theme' and
 * reflected on the document element via the data‑attribute `data-theme`.
 * Components can consume the context with the `useTheme` hook.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {}
});

/** Hook to access theme state */
export const useTheme = () => useContext(ThemeContext);

/** Provider that stores theme in localStorage and updates CSS variables */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
