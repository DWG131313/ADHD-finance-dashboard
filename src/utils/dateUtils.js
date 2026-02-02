import { getDaysInMonth as fnsGetDaysInMonth, getDate, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * Get the total number of days in a month
 * @param {Date} date - Any date within the target month
 * @returns {number} Number of days in the month
 */
export function getDaysInMonth(date) {
  return fnsGetDaysInMonth(date);
}

/**
 * Get the current day of the month (1-31)
 * @param {Date} date - The date to check
 * @returns {number} Day of month (1-indexed)
 */
export function getDayOfMonth(date) {
  return getDate(date);
}

/**
 * Calculate what percentage of the month has passed
 * This is the "expected" spending percentage for pacing
 * @param {Date} date - The current date
 * @returns {number} Percentage (0-100)
 */
export function getExpectedPacePercentage(date) {
  const dayOfMonth = getDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  return (dayOfMonth / daysInMonth) * 100;
}

/**
 * Check if a transaction date falls within a given month
 * @param {string|Date} transactionDate - The transaction date
 * @param {Date} targetMonth - Any date within the target month
 * @returns {boolean}
 */
export function isInMonth(transactionDate, targetMonth) {
  const txDate = typeof transactionDate === 'string' ? parseISO(transactionDate) : transactionDate;
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);

  return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
}

/**
 * Get the start of a month
 * @param {Date} date - Any date within the month
 * @returns {Date}
 */
export function getMonthStart(date) {
  return startOfMonth(date);
}

/**
 * Get the end of a month
 * @param {Date} date - Any date within the month
 * @returns {Date}
 */
export function getMonthEnd(date) {
  return endOfMonth(date);
}

/**
 * Format a date for display (e.g., "January 2026")
 * @param {Date} date - The date to format
 * @returns {string}
 */
export function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Parse a date string from Copilot CSV format (YYYY-MM-DD)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
export function parseDate(dateStr) {
  return parseISO(dateStr);
}
