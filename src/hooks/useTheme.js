import { useState, useEffect, useCallback } from 'react';
import { THEME } from '../constants/config';

export const useTheme = () => {
  const [theme, setTheme] = useState(THEME.light);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || THEME.light;
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === THEME.dark);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === THEME.light ? THEME.dark : THEME.light;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === THEME.dark);
  }, [theme]);

  return {
    theme,
    toggleTheme,
    isDark: theme === THEME.dark
  };
}; 