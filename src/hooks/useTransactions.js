import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { dedupeTransactions, parseCSV } from '../utils/csvParser';
import { isInMonth } from '../utils/dateUtils';
import { mapTransaction } from '../utils/categoryMapper';
import { sampleTransactions as rawSampleTransactions } from '../data/sampleTransactions';

const STORAGE_KEY = 'finance-transactions';
const IMPORT_HISTORY_KEY = 'finance-import-history';

/**
 * Apply smart category mapping to all transactions
 * Always re-applies mapping to ensure latest rules are used
 * @param {Array} transactions - Transactions to process
 * @returns {Array} Transactions with budgetCategory applied
 */
function ensureCategoryMapping(transactions) {
  return transactions.map(tx => {
    // Always apply smart mapping to use latest rules
    const mapping = mapTransaction(tx);
    return {
      ...tx,
      budgetCategory: mapping.budgetCategory,
      categorySource: mapping.source,
      categoryConfidence: mapping.confidence,
    };
  });
}

// Pre-process sample transactions with category mapping
const sampleTransactions = ensureCategoryMapping(rawSampleTransactions);

/**
 * Custom hook for managing transaction data
 * Handles loading, storing, and filtering transactions
 */
export function useTransactions() {
  // Initialize with sample data if no stored data exists
  const [rawTransactions, setTransactions] = useLocalStorage(STORAGE_KEY, sampleTransactions);
  const [importHistory, setImportHistory] = useLocalStorage(IMPORT_HISTORY_KEY, []);
  
  // Ensure all transactions have category mapping
  const transactions = useMemo(() => {
    return ensureCategoryMapping(rawTransactions);
  }, [rawTransactions]);

  /**
   * Add new transactions, merging with existing and deduplicating
   * @param {Array} newTransactions - Array of new transactions
   * @returns {number} Number of new transactions added
   */
  const addTransactions = useCallback(
    (newTransactions) => {
      const merged = dedupeTransactions(transactions, newTransactions);
      const numAdded = merged.length - transactions.length;
      setTransactions(merged);
      return numAdded;
    },
    [transactions, setTransactions]
  );

  /**
   * Import transactions from a CSV file
   * @param {File} file - The CSV file to import
   * @returns {Promise<{success: boolean, count: number, totalParsed: number, error?: string}>}
   */
  const importFromCSV = useCallback(
    async (file) => {
      try {
        const parsed = await parseCSV(file);
        const numAdded = addTransactions(parsed);

        // Record import in history
        const importRecord = {
          id: Date.now().toString(),
          filename: file.name,
          date: new Date().toISOString(),
          totalParsed: parsed.length,
          newAdded: numAdded,
          duplicatesSkipped: parsed.length - numAdded,
        };
        setImportHistory((prev) => [importRecord, ...prev].slice(0, 20)); // Keep last 20 imports

        return { success: true, count: numAdded, totalParsed: parsed.length };
      } catch (error) {
        return { success: false, count: 0, totalParsed: 0, error: error.message };
      }
    },
    [addTransactions, setImportHistory]
  );

  /**
   * Get transactions for a specific month
   * @param {Date} month - Any date within the target month
   * @returns {Array} Filtered transactions
   */
  const getTransactionsForMonth = useCallback(
    (month) => {
      return transactions.filter((tx) => isInMonth(tx.date, month));
    },
    [transactions]
  );

  /**
   * Clear all stored transactions and import history
   */
  const clearTransactions = useCallback(() => {
    setTransactions([]);
    setImportHistory([]);
  }, [setTransactions, setImportHistory]);

  /**
   * Reset to sample data and clear import history
   */
  const resetToSampleData = useCallback(() => {
    setTransactions(sampleTransactions);
    setImportHistory([]);
  }, [setTransactions, setImportHistory]);

  /**
   * Remove a specific import record from history
   * Note: This only removes the history entry, not the transactions
   */
  const removeImportRecord = useCallback(
    (importId) => {
      setImportHistory((prev) => prev.filter((record) => record.id !== importId));
    },
    [setImportHistory]
  );

  /**
   * Get the last import date
   */
  const lastImportDate = useMemo(() => {
    if (importHistory.length === 0) return null;
    return new Date(importHistory[0].date);
  }, [importHistory]);

  /**
   * Get the date range of all transactions
   * @returns {{earliest: Date|null, latest: Date|null}}
   */
  const dateRange = useMemo(() => {
    if (transactions.length === 0) {
      return { earliest: null, latest: null };
    }

    const dates = transactions.map((tx) => new Date(tx.date));
    return {
      earliest: new Date(Math.min(...dates)),
      latest: new Date(Math.max(...dates)),
    };
  }, [transactions]);

  return {
    transactions,
    addTransactions,
    importFromCSV,
    getTransactionsForMonth,
    clearTransactions,
    resetToSampleData,
    dateRange,
    transactionCount: transactions.length,
    // Import history
    importHistory,
    lastImportDate,
    removeImportRecord,
  };
}

export default useTransactions;
