
import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. ¿Hay tema guardado en localStorage?
    const saved = localStorage.getItem('happy-world-theme');
    if (saved) return saved;
    // 2. ¿El sistema prefiere modo oscuro?
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // 3. Default: claro
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('happy-world-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;

