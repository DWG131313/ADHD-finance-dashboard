import Papa from 'papaparse';
import { mapTransaction } from './categoryMapper';

/**
 * Parse a CSV file from Copilot and return normalized transactions
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} Array of normalized transactions
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }

        const transactions = results.data
          .map(normalizeTransaction)
          .filter((tx) => tx !== null);

        resolve(transactions);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Normalize a CSV row from Copilot format to internal format
 * Expected Copilot CSV columns:
 * date,name,amount,status,category,parent category,excluded,tags,type,account,account mask,note,recurring
 *
 * @param {Object} row - Raw CSV row
 * @returns {Object|null} Normalized transaction or null if invalid
 */
export function normalizeTransaction(row) {
  // Skip rows without required fields
  if (!row.date || !row.name || !row.amount) {
    return null;
  }

  // Parse amount - Copilot uses positive for expenses, negative for income
  const amount = parseFloat(row.amount);
  if (isNaN(amount)) {
    return null;
  }

  // Use Copilot's type field if available, otherwise infer from amount
  let type = row.type || (amount < 0 ? 'income' : 'regular');
  // Normalize type values
  if (type === 'internal transfer') type = 'internal_transfer';

  // Parse excluded flag
  const excluded =
    row.excluded === 'true' ||
    row.excluded === true ||
    row.excluded === '1';

  // Build the base transaction
  const transaction = {
    date: row.date,
    name: row.name.trim(),
    amount: Math.abs(amount), // Store as positive, use type for direction
    category: row.category || '',
    parentCategory: row['parent category'] || null,
    type,
    excluded,
    account: row.account || null,
    accountMask: row['account mask'] || null,
    tags: row.tags || null,
    note: row.note || null,
    recurring: row.recurring === 'true' || row.recurring === true,
    status: row.status || 'posted', // Track pending vs posted
    // Generate a unique ID for deduplication (includes account to allow same-day duplicates)
    id: generateTransactionId(row),
  };

  // Apply smart category mapping
  const mapping = mapTransaction(transaction);
  transaction.budgetCategory = mapping.budgetCategory;
  transaction.categorySource = mapping.source;
  transaction.categoryConfidence = mapping.confidence;

  return transaction;
}

/**
 * Generate a unique ID for a transaction based on its properties
 * Used for deduplication when merging multiple CSV uploads
 * Includes account to allow legitimate same-day duplicates (e.g., two coffees)
 * @param {Object} row - Transaction row
 * @returns {string} Unique identifier
 */
function generateTransactionId(row) {
  const dateStr = row.date || '';
  const name = (row.name || '').trim().toLowerCase();
  const amount = Math.abs(parseFloat(row.amount) || 0).toFixed(2);
  const account = (row.account || '').trim().toLowerCase();
  const accountMask = row['account mask'] || '';
  return `${dateStr}-${name}-${amount}-${account}-${accountMask}`;
}

/**
 * Merge new transactions with existing ones, avoiding duplicates
 * @param {Array} existing - Existing transactions
 * @param {Array} newTransactions - New transactions to merge
 * @returns {Array} Merged transactions
 */
export function dedupeTransactions(existing, newTransactions) {
  const existingIds = new Set(existing.map((tx) => tx.id));

  const uniqueNew = newTransactions.filter((tx) => !existingIds.has(tx.id));

  // Combine and sort by date (newest first)
  const combined = [...existing, ...uniqueNew];
  combined.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  return combined;
}

/**
 * Validate that a file is a CSV
 * @param {File} file - The file to validate
 * @returns {boolean}
 */
export function isValidCSVFile(file) {
  if (!file) return false;

  // Check file extension
  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv')) return false;

  // Check MIME type (some browsers may not set it)
  if (file.type && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
    return false;
  }

  return true;
}
