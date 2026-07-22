import { createContext, useContext, useEffect, useState } from 'react';
import { fetchFestivalTheme } from '../api';

const FestivalContext = createContext({
  theme: null,
  loading: true,
  refresh: async () => {},
});

const DEFAULTS = {
  active: false,
  festival_key: 'none',
  animation: 'none',
  announcements: [
    'Free Shipping on Orders Above ₹999',
    '100% Purchase Protection',
    'WhatsApp for Quick Orders',
    'Use code FIRST10 for 10% off!',
  ],
  accent_primary: '#7B1E3A',
  accent_secondary: '#C9A84C',
  accent_bg: '#FAF7F2',
};

function applyCssVars(theme) {
  const root = document.documentElement;
  const primary = theme?.accent_primary || DEFAULTS.accent_primary;
  const secondary = theme?.accent_secondary || DEFAULTS.accent_secondary;
  const bg = theme?.accent_bg || DEFAULTS.accent_bg;
  root.style.setProperty('--color-maroon', primary);
  root.style.setProperty('--color-maroon-dark', primary);
  root.style.setProperty('--color-gold', secondary);
  root.style.setProperty('--color-cream', bg);
  root.style.setProperty('--color-gold-light', '#F5E6C8');
}

function applyBodyClass(theme) {
  document.body.classList.forEach((c) => {
    if (c.startsWith('festival-active') || c.startsWith('festival-key-')) {
      document.body.classList.remove(c);
    }
  });
  if (theme?.active && theme.festival_key && theme.festival_key !== 'none') {
    document.body.classList.add('festival-active');
    document.body.classList.add(`festival-key-${theme.festival_key}`);
  }
}

export function FestivalProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await fetchFestivalTheme();
      const next = { ...DEFAULTS, ...data };
      setTheme(next);
      applyCssVars(data?.active ? data : DEFAULTS);
      applyBodyClass(next);
    } catch {
      setTheme(DEFAULTS);
      applyCssVars(DEFAULTS);
      applyBodyClass(DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <FestivalContext.Provider value={{ theme, loading, refresh }}>
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  return useContext(FestivalContext);
}
