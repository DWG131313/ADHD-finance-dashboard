import { useState, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  calculateAllCategorySpending,
  calculateTotalFlexibleSpending,
  calculatePaceStatus,
} from '../utils/budgetCalculations';
import {
  getDaysInMonth,
  getDayOfMonth,
  formatMonthYear,
} from '../utils/dateUtils';
import {
  DEFAULT_CATEGORY_BUDGETS,
  PHASE2_CATEGORY_BUDGETS,
  getBudgetCategories,
} from '../utils/categoryMapper';

const SETTINGS_KEY = 'finance-settings';

const DEFAULT_SETTINGS = {
  weeklyBudget: 500,
  budgetPhase: 1,
  customCategoryBudgets: null, // null means use defaults for current phase
  enableRollover: true, // Enable weekly rollover budgets
};

/**
 * Check if two dates are in the same month and year
 */
function isSameMonth(date1, date2) {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Get the week number within the month (1-indexed)
 * Week 1: Days 1-7, Week 2: Days 8-14, etc.
 */
function getWeekOfMonth(date) {
  const day = date.getDate();
  return Math.ceil(day / 7);
}

/**
 * Get the start and end dates for a week within a month
 */
function getWeekBounds(year, month, weekNum) {
  const startDay = (weekNum - 1) * 7 + 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endDay = Math.min(weekNum * 7, daysInMonth);

  return {
    start: new Date(year, month, startDay),
    end: new Date(year, month, endDay, 23, 59, 59),
  };
}

/**
 * Custom hook for budget calculations and settings
 * Combines transaction data with budget configuration
 */
export function useBudget(transactions) {
  // Current month being viewed
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Persisted settings
  const [settings, setSettings] = useLocalStorage(SETTINGS_KEY, DEFAULT_SETTINGS);

  // Determine the effective "day of month" for pacing calculations
  // For current month: use today's day
  // For past months: use last day of month (full month view)
  // For future months: use day 1
  const effectiveDayOfMonth = useMemo(() => {
    const today = new Date();
    const daysInSelected = getDaysInMonth(selectedMonth);

    if (isSameMonth(selectedMonth, today)) {
      // Current month - use today's day
      return getDayOfMonth(today);
    } else if (selectedMonth < today) {
      // Past month - show full month (last day)
      return daysInSelected;
    } else {
      // Future month - show beginning
      return 1;
    }
  }, [selectedMonth]);

  // Get the category budgets based on current phase
  const categoryBudgets = useMemo(() => {
    if (settings.customCategoryBudgets) {
      return settings.customCategoryBudgets;
    }
    return settings.budgetPhase === 1 ? DEFAULT_CATEGORY_BUDGETS : PHASE2_CATEGORY_BUDGETS;
  }, [settings.budgetPhase, settings.customCategoryBudgets]);

  // Calculate spending for the selected month
  const categorySpending = useMemo(() => {
    const spending = calculateAllCategorySpending(transactions, selectedMonth);
    // Ensure all budget categories have a value (even if 0)
    const budgetCategories = getBudgetCategories();
    budgetCategories.forEach((cat) => {
      if (spending[cat] === undefined) {
        spending[cat] = 0;
      }
    });
    return spending;
  }, [transactions, selectedMonth]);

  // Calculate total flexible spending
  const totalFlexibleSpending = useMemo(() => {
    return calculateTotalFlexibleSpending(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Calculate total budget for the month (sum of all category budgets)
  const totalMonthlyBudget = useMemo(() => {
    return Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
  }, [categoryBudgets]);

  // Calculate weekly budget pacing
  const weeklyPaceStatus = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);

    return calculatePaceStatus(
      totalFlexibleSpending,
      settings.weeklyBudget * (daysInMonth / 7), // Total monthly "weekly budget"
      effectiveDayOfMonth,
      daysInMonth
    );
  }, [totalFlexibleSpending, settings.weeklyBudget, selectedMonth, effectiveDayOfMonth]);

  // Calculate monthly pacing (overall)
  const monthlyPaceStatus = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);

    return calculatePaceStatus(
      totalFlexibleSpending,
      totalMonthlyBudget,
      effectiveDayOfMonth,
      daysInMonth
    );
  }, [totalFlexibleSpending, totalMonthlyBudget, selectedMonth, effectiveDayOfMonth]);

  // Calculate category-level pacing
  const categoryPaceStatus = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const result = {};

    Object.keys(categoryBudgets).forEach((category) => {
      const spent = categorySpending[category] || 0;
      const budget = categoryBudgets[category];
      result[category] = calculatePaceStatus(spent, budget, effectiveDayOfMonth, daysInMonth);
    });

    return result;
  }, [categorySpending, categoryBudgets, selectedMonth, effectiveDayOfMonth]);

  // Calculate weekly rollover budget
  const weeklyRollover = useMemo(() => {
    if (!settings.enableRollover) {
      return null;
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = getDaysInMonth(selectedMonth);
    const totalWeeks = Math.ceil(daysInMonth / 7);
    const baseWeeklyBudget = totalMonthlyBudget / totalWeeks;

    // Get current week (for current month) or last week (for past months)
    const today = new Date();
    const isCurrentMonth = isSameMonth(selectedMonth, today);
    const currentWeek = isCurrentMonth ? getWeekOfMonth(today) : totalWeeks;

    // Calculate spending for each week
    const weeklyData = [];
    let cumulativeRollover = 0;

    for (let week = 1; week <= totalWeeks; week++) {
      const { start, end } = getWeekBounds(year, month, week);

      // Sum spending for this week
      const weekSpending = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          // Only count flexible spending (not fixed bills, etc.)
          if (tx.amount < 0) return false; // Skip income
          const isInWeek = txDate >= start && txDate <= end;
          const isInMonth = txDate.getMonth() === month && txDate.getFullYear() === year;
          return isInWeek && isInMonth;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Calculate this week's effective budget (base + rollover from previous weeks)
      const effectiveBudget = baseWeeklyBudget + cumulativeRollover;
      const surplus = effectiveBudget - weekSpending;

      // For completed weeks, add to cumulative rollover
      const isCompleted = week < currentWeek;
      if (isCompleted) {
        cumulativeRollover = surplus;
      }

      weeklyData.push({
        week,
        startDay: (week - 1) * 7 + 1,
        endDay: Math.min(week * 7, daysInMonth),
        baseBudget: baseWeeklyBudget,
        effectiveBudget: week === 1 ? baseWeeklyBudget : baseWeeklyBudget + (weeklyData[week - 2]?.rolloverToNext || 0),
        spent: weekSpending,
        surplus,
        rolloverToNext: isCompleted ? surplus : 0,
        isCurrentWeek: week === currentWeek,
        isCompleted,
      });
    }

    // Current week's data
    const currentWeekData = weeklyData[currentWeek - 1] || weeklyData[weeklyData.length - 1];
    const effectiveBudgetThisWeek = baseWeeklyBudget + cumulativeRollover;
    const remainingThisWeek = effectiveBudgetThisWeek - (currentWeekData?.spent || 0);

    return {
      enabled: true,
      baseWeeklyBudget,
      currentWeek,
      totalWeeks,
      cumulativeRollover,
      effectiveBudgetThisWeek,
      spentThisWeek: currentWeekData?.spent || 0,
      remainingThisWeek,
      weeklyData,
      // Helpful display values
      rolloverAmount: Math.abs(cumulativeRollover),
      rolloverType: cumulativeRollover >= 0 ? 'surplus' : 'deficit',
      hasRollover: Math.abs(cumulativeRollover) > 1, // Ignore tiny amounts
    };
  }, [transactions, selectedMonth, totalMonthlyBudget, settings.enableRollover]);

  // Helper function to update settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Helper to set budget phase
  const setBudgetPhase = (phase) => {
    updateSettings({ budgetPhase: phase, customCategoryBudgets: null });
  };

  // Helper to update weekly budget
  const setWeeklyBudget = (amount) => {
    updateSettings({ weeklyBudget: amount });
  };

  // Helper to update category budgets
  const setCategoryBudgets = (newBudgets) => {
    updateSettings({ customCategoryBudgets: newBudgets });
  };

  // Helper to toggle rollover budgets
  const toggleRollover = () => {
    updateSettings({ enableRollover: !settings.enableRollover });
  };

  // Format month for display
  const selectedMonthLabel = formatMonthYear(selectedMonth);

  // Date info for the selected month
  const monthInfo = useMemo(() => ({
    dayOfMonth: effectiveDayOfMonth,
    daysInMonth: getDaysInMonth(selectedMonth),
    label: selectedMonthLabel,
    isCurrentMonth: isSameMonth(selectedMonth, new Date()),
  }), [selectedMonth, selectedMonthLabel, effectiveDayOfMonth]);

  return {
    // Month selection
    selectedMonth,
    setSelectedMonth,
    monthInfo,

    // Budget configuration
    weeklyBudget: settings.weeklyBudget,
    setWeeklyBudget,
    categoryBudgets,
    setCategoryBudgets,
    budgetPhase: settings.budgetPhase,
    setBudgetPhase,
    totalMonthlyBudget,

    // Spending calculations
    categorySpending,
    totalFlexibleSpending,

    // Pacing status
    weeklyPaceStatus,
    monthlyPaceStatus,
    categoryPaceStatus,

    // Weekly rollover
    weeklyRollover,
    enableRollover: settings.enableRollover,
    toggleRollover,
  };
}

export default useBudget;
