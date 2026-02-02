import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { shouldExcludeTransaction } from '../utils/categoryMapper';

/**
 * Format a date string for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get category badge color - expanded for new categories
 */
function getCategoryColor(budgetCategory) {
  const colors = {
    // Flexible
    Groceries: 'bg-green-500/20 text-green-400',
    Dining: 'bg-orange-500/20 text-orange-400',
    Discretionary: 'bg-purple-500/20 text-purple-400',
    Travel: 'bg-blue-500/20 text-blue-400',
    Dates: 'bg-pink-500/20 text-pink-400',
    
    // Trackable
    Subscriptions: 'bg-indigo-500/20 text-indigo-400',
    'Tech & AI': 'bg-cyan-500/20 text-cyan-400',
    Entertainment: 'bg-fuchsia-500/20 text-fuchsia-400',
    'Personal Care': 'bg-rose-500/20 text-rose-400',
    Clothing: 'bg-violet-500/20 text-violet-400',
    Shopping: 'bg-slate-500/20 text-slate-400',
    Pet: 'bg-orange-500/20 text-orange-400',
    Hobbies: 'bg-amber-500/20 text-amber-400',
    Vices: 'bg-red-500/20 text-red-400',
    Transportation: 'bg-yellow-500/20 text-yellow-400',
    Health: 'bg-emerald-500/20 text-emerald-400',
    Donations: 'bg-teal-500/20 text-teal-400',
    Cash: 'bg-lime-500/20 text-lime-400',
    
    // Fixed
    Rent: 'bg-gray-500/20 text-gray-400',
    Utilities: 'bg-gray-500/20 text-gray-400',
    Insurance: 'bg-gray-500/20 text-gray-400',
    Loans: 'bg-gray-500/20 text-gray-400',
    
    // Problem
    Uncategorized: 'bg-red-600/30 text-red-400 ring-1 ring-red-500/50',
  };
  return colors[budgetCategory] || 'bg-gray-500/20 text-gray-400';
}

/**
 * Check if a transaction needs attention
 */
function needsAttention(tx) {
  if (shouldExcludeTransaction(tx)) return false;
  if (tx.budgetCategory === 'Uncategorized') return true;
  if (tx.category === 'Other') return true;
  if (tx.categoryConfidence === 'low' && tx.amount > 50) return true;
  return false;
}

/**
 * Transaction list with search, filter, and category grouping
 */
export function TransactionList({
  transactions,
  selectedMonth,
  showAllMonths = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'expense', 'income', 'attention'

  // Filter transactions for the selected month (or all if showAllMonths)
  const monthTransactions = useMemo(() => {
    if (showAllMonths) return transactions;

    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });
  }, [transactions, selectedMonth, showAllMonths]);

  // Count transactions needing attention
  const attentionCount = useMemo(() => {
    return monthTransactions.filter(needsAttention).length;
  }, [monthTransactions]);

  // Get unique categories for filter (using budgetCategory)
  const categories = useMemo(() => {
    const cats = new Set(monthTransactions.map((tx) => tx.budgetCategory || 'Uncategorized'));
    return ['all', ...Array.from(cats).sort()];
  }, [monthTransactions]);

  // Get unique accounts for filter
  const accounts = useMemo(() => {
    const accts = new Set(
      monthTransactions
        .map((tx) => tx.account)
        .filter(Boolean)
    );
    return ['all', ...Array.from(accts).sort()];
  }, [monthTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = tx.name.toLowerCase().includes(search);
        const matchesCategory = (tx.category || '').toLowerCase().includes(search);
        const matchesBudgetCat = (tx.budgetCategory || '').toLowerCase().includes(search);
        const matchesAccount = (tx.account || '').toLowerCase().includes(search);
        const matchesTags = (tx.tags || '').toLowerCase().includes(search);
        if (!matchesName && !matchesCategory && !matchesBudgetCat && !matchesAccount && !matchesTags) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if ((tx.budgetCategory || 'Uncategorized') !== categoryFilter) return false;
      }

      // Account filter
      if (accountFilter !== 'all') {
        if (tx.account !== accountFilter) return false;
      }

      // Type filter
      if (typeFilter === 'expense' && tx.type === 'income') return false;
      if (typeFilter === 'income' && tx.type !== 'income') return false;
      if (typeFilter === 'attention' && !needsAttention(tx)) return false;

      return true;
    });
  }, [monthTransactions, searchTerm, categoryFilter, accountFilter, typeFilter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    // Sort dates descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTransactions]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredTransactions
      .filter((tx) => tx.type !== 'income' && !tx.excluded)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  return (
    <div className="bg-background-card rounded-xl shadow-lg overflow-hidden">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-700">
        {/* Attention banner */}
        {attentionCount > 0 && typeFilter !== 'attention' && (
          <button
            onClick={() => setTypeFilter('attention')}
            className="w-full mb-3 p-3 bg-warning/10 border border-warning/30 rounded-lg text-left hover:bg-warning/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-warning text-lg">⚠</span>
                <span className="text-warning font-medium">
                  {attentionCount} transaction{attentionCount !== 1 ? 's' : ''} need attention
                </span>
              </div>
              <span className="text-warning/70 text-sm">Fix in Copilot →</span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Uncategorized, marked as &quot;Other&quot;, or low confidence mapping
            </p>
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-text focus:outline-none focus:border-accent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Account filter */}
          {accounts.length > 2 && (
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-text focus:outline-none focus:border-accent"
            >
              {accounts.map((acct) => (
                <option key={acct} value={acct}>
                  {acct === 'all' ? 'All Accounts' : acct}
                </option>
              ))}
            </select>
          )}

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-2 bg-gray-800 border rounded-lg text-text focus:outline-none focus:border-accent ${
              typeFilter === 'attention' ? 'border-warning' : 'border-gray-700'
            }`}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="attention">⚠ Needs Attention ({attentionCount})</option>
          </select>
        </div>

        {/* Summary row */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700 text-sm">
          <span className="text-text-muted">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-4">
            <span className="text-success">+{formatCurrency(totals.income)}</span>
            <span className="text-danger">-{formatCurrency(totals.expenses)}</span>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="max-h-[500px] overflow-y-auto">
        {groupedTransactions.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No transactions found
          </div>
        ) : (
          groupedTransactions.map(([date, txs]) => (
            <div key={date}>
              {/* Date header */}
              <div className="sticky top-0 px-4 py-2 bg-gray-800/90 backdrop-blur-sm text-xs font-medium text-text-muted uppercase tracking-wide">
                {formatDate(date)}
              </div>

              {/* Transactions for this date */}
              {txs.map((tx, idx) => {
                const budgetCategory = tx.budgetCategory || 'Uncategorized';
                const isIncome = tx.type === 'income';
                const attention = needsAttention(tx);

                return (
                  <div
                    key={`${tx.id || idx}`}
                    className={`px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      attention ? 'bg-warning/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {attention && (
                            <span className="text-warning" title="Needs attention in Copilot">⚠</span>
                          )}
                          <span className="text-text font-medium truncate">
                            {tx.name}
                          </span>
                          {tx.excluded && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">
                              Excluded
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(budgetCategory)}`}
                          >
                            {budgetCategory}
                          </span>
                          {tx.category && tx.category !== budgetCategory && tx.category !== '' && (
                            <span className="text-xs text-text-muted">
                              ← {tx.category}
                            </span>
                          )}
                          {tx.tags && (
                            <span className="text-xs text-accent">
                              #{tx.tags}
                            </span>
                          )}
                          {tx.categoryConfidence === 'low' && (
                            <span className="text-xs text-warning" title={`Mapped via: ${tx.categorySource}`}>
                              (low confidence)
                            </span>
                          )}
                          {tx.account && (
                            <span className="text-xs text-text-muted/60" title={tx.accountMask ? `****${tx.accountMask}` : ''}>
                              • {tx.account}
                            </span>
                          )}
                          {tx.status === 'pending' && (
                            <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`text-right font-medium ${
                          isIncome ? 'text-success' : 'text-text'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionList;
