import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const PREFERENCES_KEY = 'finance-preferences';

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES = {
  focusMode: false,
  theme: 'dark', // 'dark' | 'light'
  reducedMotion: false,
  lastVisit: null,
};

/**
 * Custom hook for user preferences
 * Includes focus mode, theme, and accessibility options
 */
export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage(PREFERENCES_KEY, DEFAULT_PREFERENCES);

  /**
   * Toggle focus mode
   */
  const toggleFocusMode = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      focusMode: !prev.focusMode,
    }));
  }, [setPreferences]);

  /**
   * Set focus mode explicitly
   */
  const setFocusMode = useCallback((enabled) => {
    setPreferences((prev) => ({
      ...prev,
      focusMode: enabled,
    }));
  }, [setPreferences]);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, [setPreferences]);

  /**
   * Toggle reduced motion
   */
  const toggleReducedMotion = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }));
  }, [setPreferences]);

  /**
   * Update last visit timestamp
   */
  const updateLastVisit = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      lastVisit: new Date().toISOString(),
    }));
  }, [setPreferences]);

  /**
   * Setup keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // F key toggles focus mode
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode]);

  /**
   * Respect system preference for reduced motion
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !preferences.reducedMotion) {
      setPreferences((prev) => ({
        ...prev,
        reducedMotion: true,
      }));
    }
  }, [preferences.reducedMotion, setPreferences]);

  return {
    ...preferences,
    toggleFocusMode,
    setFocusMode,
    toggleTheme,
    toggleReducedMotion,
    updateLastVisit,
  };
}

export default usePreferences;
