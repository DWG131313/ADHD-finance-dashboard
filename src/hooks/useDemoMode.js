import { useState, useCallback } from 'react';

const DEMO_MODE_KEY = 'finance-demo-mode';

/**
 * Hook to manage demo mode state
 * When demo mode is active, the app shows simulated data instead of real data
 */
export function useDemoMode() {
  // Initialize from sessionStorage (not localStorage - demo mode shouldn't persist across sessions)
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return sessionStorage.getItem(DEMO_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const newValue = !prev;
      try {
        if (newValue) {
          sessionStorage.setItem(DEMO_MODE_KEY, 'true');
        } else {
          sessionStorage.removeItem(DEMO_MODE_KEY);
        }
      } catch {
        // Ignore storage errors
      }
      return newValue;
    });
  }, []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    try {
      sessionStorage.setItem(DEMO_MODE_KEY, 'true');
    } catch {
      // Ignore
    }
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    try {
      sessionStorage.removeItem(DEMO_MODE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    isDemoMode,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
  };
}

export default useDemoMode;
