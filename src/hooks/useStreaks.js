import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STREAKS_KEY = 'finance-streaks';

/**
 * Get ISO week string for a date (YYYY-Www)
 */
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday (for ISO week calculation)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = Math.round(((d - week1) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Get the previous week key
 */
function getPreviousWeekKey(weekKey) {
  const [year, week] = weekKey.split('-W').map(Number);
  if (week === 1) {
    return `${year - 1}-W52`;
  }
  return `${year}-W${String(week - 1).padStart(2, '0')}`;
}

/**
 * Default streak state
 */
const DEFAULT_STREAKS = {
  // Budget streak - consecutive weeks under budget
  budgetWeeks: [], // Array of week keys where user was under budget
  currentBudgetStreak: 0,
  bestBudgetStreak: 0,

  // Update streak - consecutive weeks with balance updates
  updateWeeks: [], // Array of week keys where user updated balances
  currentUpdateStreak: 0,
  bestUpdateStreak: 0,

  lastUpdated: null,
};

/**
 * Custom hook for streak tracking
 * ADHD UX: Streaks create commitment and provide regular dopamine hits
 */
export function useStreaks() {
  const [state, setState] = useLocalStorage(STREAKS_KEY, DEFAULT_STREAKS);

  /**
   * Calculate current streak from array of week keys
   */
  const calculateStreak = useCallback((weeks) => {
    if (weeks.length === 0) return 0;

    const sortedWeeks = [...weeks].sort().reverse();
    const currentWeek = getWeekKey(new Date());
    const lastWeek = getPreviousWeekKey(currentWeek);

    // Check if current or last week is in the list (grace period)
    let streak = 0;
    let checkWeek = sortedWeeks.includes(currentWeek) ? currentWeek : lastWeek;

    if (!sortedWeeks.includes(checkWeek)) {
      // Neither current nor last week - streak broken
      return 0;
    }

    // Count backwards
    while (sortedWeeks.includes(checkWeek)) {
      streak++;
      checkWeek = getPreviousWeekKey(checkWeek);
    }

    return streak;
  }, []);

  /**
   * Record that user was under budget this week
   */
  const recordUnderBudget = useCallback(() => {
    const weekKey = getWeekKey(new Date());

    setState((prev) => {
      if (prev.budgetWeeks.includes(weekKey)) {
        return prev; // Already recorded this week
      }

      const newWeeks = [...prev.budgetWeeks, weekKey];
      const newStreak = calculateStreak(newWeeks);

      return {
        ...prev,
        budgetWeeks: newWeeks,
        currentBudgetStreak: newStreak,
        bestBudgetStreak: Math.max(prev.bestBudgetStreak, newStreak),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [setState, calculateStreak]);

  /**
   * Record that user updated balances this week
   */
  const recordBalanceUpdate = useCallback(() => {
    const weekKey = getWeekKey(new Date());

    setState((prev) => {
      if (prev.updateWeeks.includes(weekKey)) {
        return prev; // Already recorded this week
      }

      const newWeeks = [...prev.updateWeeks, weekKey];
      const newStreak = calculateStreak(newWeeks);

      return {
        ...prev,
        updateWeeks: newWeeks,
        currentUpdateStreak: newStreak,
        bestUpdateStreak: Math.max(prev.bestUpdateStreak, newStreak),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [setState, calculateStreak]);

  /**
   * Get current streaks (recalculated for accuracy)
   */
  const streaks = useMemo(() => {
    const budgetStreak = calculateStreak(state.budgetWeeks);
    const updateStreak = calculateStreak(state.updateWeeks);

    return {
      budget: {
        current: budgetStreak,
        best: Math.max(state.bestBudgetStreak, budgetStreak),
        weeksRecorded: state.budgetWeeks.length,
      },
      update: {
        current: updateStreak,
        best: Math.max(state.bestUpdateStreak, updateStreak),
        weeksRecorded: state.updateWeeks.length,
      },
    };
  }, [state, calculateStreak]);

  /**
   * Check if user has updated this week
   */
  const hasUpdatedThisWeek = useMemo(() => {
    const currentWeek = getWeekKey(new Date());
    return state.updateWeeks.includes(currentWeek);
  }, [state.updateWeeks]);

  /**
   * Check if user was under budget this week
   */
  const wasUnderBudgetThisWeek = useMemo(() => {
    const currentWeek = getWeekKey(new Date());
    return state.budgetWeeks.includes(currentWeek);
  }, [state.budgetWeeks]);

  /**
   * Reset all streaks
   */
  const resetStreaks = useCallback(() => {
    setState(DEFAULT_STREAKS);
  }, [setState]);

  return {
    streaks,
    recordUnderBudget,
    recordBalanceUpdate,
    hasUpdatedThisWeek,
    wasUnderBudgetThisWeek,
    resetStreaks,
  };
}

export default useStreaks;
