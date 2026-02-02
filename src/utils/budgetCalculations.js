import { isInMonth } from './dateUtils';
import { isFlexibleCategory, shouldExcludeTransaction, mapTransaction } from './categoryMapper';

// Known one-time/annual merchants for normalized spending
const ONE_TIME_MERCHANTS = [
  'Frame Central',
  'Emerald City',
  'Comic Con',
  'Tattoo',
  'Gym Renewal',
  'Provail',
  'CLEAR',
  'Amazon Prime',
];

/**
 * Get the budget category for a transaction
 * Uses pre-calculated budgetCategory if available, otherwise calculates it
 * @param {Object} tx - Transaction object
 * @returns {string} Budget category
 */
function getBudgetCategory(tx) {
  // Use pre-calculated category if available (from CSV import)
  if (tx.budgetCategory) {
    return tx.budgetCategory;
  }
  // Otherwise calculate on the fly
  return mapTransaction(tx).budgetCategory;
}

/**
 * Calculate total spending for a specific budget category in a given month
 * @param {Array} transactions - All transactions
 * @param {string} budgetCategory - The budget category (e.g., 'Groceries', 'Dining')
 * @param {Date} month - The target month
 * @returns {number} Total spending amount
 */
export function calculateCategorySpending(transactions, budgetCategory, month) {
  return transactions
    .filter((tx) => {
      if (shouldExcludeTransaction(tx)) return false;
      if (!isInMonth(tx.date, month)) return false;
      return getBudgetCategory(tx) === budgetCategory;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculate spending for all flexible budget categories
 * @param {Array} transactions - All transactions
 * @param {Date} month - The target month
 * @returns {Object} Spending by category { Groceries: 387, Dining: 1127, ... }
 */
export function calculateAllCategorySpending(transactions, month) {
  const spending = {};

  transactions.forEach((tx) => {
    if (shouldExcludeTransaction(tx)) return;
    if (!isInMonth(tx.date, month)) return;

    const budgetCategory = getBudgetCategory(tx);
    if (!isFlexibleCategory(budgetCategory)) return;

    spending[budgetCategory] = (spending[budgetCategory] || 0) + tx.amount;
  });

  return spending;
}

/**
 * Calculate total flexible spending for a month
 * This is all spending in flexible categories
 * @param {Array} transactions - All transactions
 * @param {Date} month - The target month
 * @returns {number} Total flexible spending
 */
export function calculateTotalFlexibleSpending(transactions, month) {
  return transactions
    .filter((tx) => {
      if (shouldExcludeTransaction(tx)) return false;
      if (!isInMonth(tx.date, month)) return false;
      const budgetCategory = getBudgetCategory(tx);
      return isFlexibleCategory(budgetCategory);
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calculate spending by all categories (not just flexible)
 * Useful for seeing full spending breakdown
 * @param {Array} transactions - All transactions
 * @param {Date} month - The target month
 * @returns {Object} Spending by category
 */
export function calculateFullCategorySpending(transactions, month) {
  const spending = {};

  transactions.forEach((tx) => {
    if (shouldExcludeTransaction(tx)) return;
    if (!isInMonth(tx.date, month)) return;

    const budgetCategory = getBudgetCategory(tx);
    spending[budgetCategory] = (spending[budgetCategory] || 0) + tx.amount;
  });

  return spending;
}

/**
 * Calculate the pace status for budget tracking
 * @param {number} spent - Amount spent so far
 * @param {number} budget - Total budget for the period
 * @param {number} dayOfMonth - Current day of the month
 * @param {number} daysInMonth - Total days in the month
 * @returns {Object} { percentage, expectedPercentage, status, difference }
 */
export function calculatePaceStatus(spent, budget, dayOfMonth, daysInMonth) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const expectedPercentage = (dayOfMonth / daysInMonth) * 100;
  const difference = percentage - expectedPercentage;

  // Determine status based on how actual compares to expected
  let status;
  if (percentage <= expectedPercentage) {
    status = 'under'; // Green - spending less than expected
  } else if (percentage <= expectedPercentage * 1.1) {
    status = 'on-pace'; // Yellow - slightly over but within 10%
  } else {
    status = 'over'; // Red - significantly over pace
  }

  return {
    percentage: Math.round(percentage * 10) / 10,
    expectedPercentage: Math.round(expectedPercentage * 10) / 10,
    status,
    difference: Math.round(difference * 10) / 10,
  };
}

/**
 * Check if a transaction is likely a one-time expense
 * (should be excluded from "normalized" spending views)
 * @param {Object} transaction - The transaction to check
 * @returns {boolean}
 */
export function isOneTimeTransaction(transaction) {
  // High amount transactions (over $200)
  if (transaction.amount > 200) return true;

  // Known one-time merchants
  const isKnownOneTime = ONE_TIME_MERCHANTS.some((merchant) =>
    transaction.name.toLowerCase().includes(merchant.toLowerCase())
  );
  if (isKnownOneTime) return true;

  return false;
}

/**
 * Calculate normalized spending (excluding one-time expenses)
 * @param {Array} transactions - All transactions
 * @param {Date} month - The target month
 * @returns {number} Normalized flexible spending
 */
export function calculateNormalizedSpending(transactions, month) {
  return transactions
    .filter((tx) => {
      if (shouldExcludeTransaction(tx)) return false;
      if (!isInMonth(tx.date, month)) return false;
      if (isOneTimeTransaction(tx)) return false;
      const budgetCategory = getBudgetCategory(tx);
      return isFlexibleCategory(budgetCategory);
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get transaction statistics for a month
 * @param {Array} transactions - All transactions
 * @param {Date} month - The target month
 * @returns {Object} Stats including counts, totals, uncategorized
 */
export function getMonthlyStats(transactions, month) {
  const monthTx = transactions.filter(tx => isInMonth(tx.date, month));
  const nonExcluded = monthTx.filter(tx => !shouldExcludeTransaction(tx));
  
  const uncategorized = nonExcluded.filter(tx => {
    const cat = getBudgetCategory(tx);
    return cat === 'Uncategorized';
  });
  
  const lowConfidence = nonExcluded.filter(tx => 
    tx.categoryConfidence === 'low' && tx.amount > 50
  );
  
  const copilotOther = nonExcluded.filter(tx => tx.category === 'Other');

  return {
    totalTransactions: monthTx.length,
    activeTransactions: nonExcluded.length,
    uncategorizedCount: uncategorized.length,
    lowConfidenceCount: lowConfidence.length,
    copilotOtherCount: copilotOther.length,
    needsAttentionCount: new Set([
      ...uncategorized.map(t => t.id),
      ...lowConfidence.map(t => t.id),
      ...copilotOther.map(t => t.id),
    ]).size,
  };
}

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string like "$1,234.56"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 * @param {number} percentage - The percentage (0-100+)
 * @returns {string} Formatted string like "48%"
 */
export function formatPercentage(percentage) {
  return `${Math.round(percentage)}%`;
}
