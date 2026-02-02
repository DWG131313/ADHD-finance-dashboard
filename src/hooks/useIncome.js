import { useLocalStorage } from './useLocalStorage';

const INCOME_KEY = 'finance-income';

/**
 * Default income configuration
 */
const DEFAULT_INCOME_CONFIG = {
  // Bi-weekly paycheck settings
  paycheck: {
    amount: 5100,
    frequency: 'biweekly', // 'biweekly', 'monthly', 'semimonthly'
    // For bi-weekly: we need a reference date to calculate pay dates
    // This is the date of a known paycheck
    referenceDate: '2026-01-17', // A Friday when you got paid
  },
  
  // Extra income entries (stock sales, bonuses, etc.)
  // Keyed by YYYY-MM for the month
  extraIncome: {},
};

/**
 * Calculate bi-weekly pay dates for a given month
 * @param {Date} month - The month to calculate for
 * @param {string} referenceDate - A known pay date (YYYY-MM-DD)
 * @returns {Date[]} Array of pay dates in that month
 */
function getBiweeklyPayDates(month, referenceDate) {
  const refDate = new Date(referenceDate);
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  const payDates = [];
  
  // Find the first pay date on or after refDate
  let currentPayDate = new Date(refDate);
  
  // If reference is after month end, go backwards
  while (currentPayDate > monthEnd) {
    currentPayDate.setDate(currentPayDate.getDate() - 14);
  }
  
  // If reference is before month start, go forwards
  while (currentPayDate < monthStart) {
    currentPayDate.setDate(currentPayDate.getDate() + 14);
  }
  
  // Now find all pay dates in this month
  // First, go back to find any earlier ones in the month
  let checkDate = new Date(currentPayDate);
  while (checkDate >= monthStart) {
    checkDate.setDate(checkDate.getDate() - 14);
  }
  checkDate.setDate(checkDate.getDate() + 14); // Go forward one period
  
  // Collect all pay dates in the month
  while (checkDate <= monthEnd) {
    if (checkDate >= monthStart) {
      payDates.push(new Date(checkDate));
    }
    checkDate.setDate(checkDate.getDate() + 14);
  }
  
  return payDates;
}

/**
 * Format month key for storage
 */
function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Custom hook for income tracking
 */
export function useIncome() {
  const [config, setConfig] = useLocalStorage(INCOME_KEY, DEFAULT_INCOME_CONFIG);

  /**
   * Calculate expected income for a given month
   */
  const getMonthlyIncome = (month) => {
    const payDates = getBiweeklyPayDates(month, config.paycheck.referenceDate);
    const paycheckTotal = payDates.length * config.paycheck.amount;
    
    // Get extra income for this month
    const monthKey = getMonthKey(month);
    const extraEntries = config.extraIncome[monthKey] || [];
    const extraTotal = extraEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      paycheckCount: payDates.length,
      paycheckAmount: config.paycheck.amount,
      paycheckTotal,
      payDates,
      extraIncome: extraEntries,
      extraTotal,
      totalIncome: paycheckTotal + extraTotal,
    };
  };

  /**
   * Add extra income for a month (stock sale, bonus, etc.)
   */
  const addExtraIncome = (month, entry) => {
    const monthKey = getMonthKey(month);
    const existing = config.extraIncome[monthKey] || [];
    
    setConfig({
      ...config,
      extraIncome: {
        ...config.extraIncome,
        [monthKey]: [
          ...existing,
          {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            ...entry,
          },
        ],
      },
    });
  };

  /**
   * Remove extra income entry
   */
  const removeExtraIncome = (month, entryId) => {
    const monthKey = getMonthKey(month);
    const existing = config.extraIncome[monthKey] || [];
    
    setConfig({
      ...config,
      extraIncome: {
        ...config.extraIncome,
        [monthKey]: existing.filter((e) => e.id !== entryId),
      },
    });
  };

  /**
   * Update paycheck settings
   */
  const updatePaycheckSettings = (settings) => {
    setConfig({
      ...config,
      paycheck: {
        ...config.paycheck,
        ...settings,
      },
    });
  };

  return {
    config,
    getMonthlyIncome,
    addExtraIncome,
    removeExtraIncome,
    updatePaycheckSettings,
  };
}

export default useIncome;
