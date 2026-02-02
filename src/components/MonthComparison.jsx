import { useMemo } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { FLEXIBLE_CATEGORIES } from '../utils/categoryMapper';

/**
 * Compare current month spending to previous month
 */
export function MonthComparison({
  transactions,
  selectedMonth,
  monthLabel,
}) {
  const comparison = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    // Filter transactions for each month (flexible categories only, exclude income/excluded)
    const filterForMonth = (y, m) =>
      transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getFullYear() === y &&
          txDate.getMonth() === m &&
          tx.type !== 'income' &&
          !tx.excluded &&
          FLEXIBLE_CATEGORIES.includes(tx.budgetCategory)
        );
      });

    const currentMonthTx = filterForMonth(year, month);
    const prevMonthTx = filterForMonth(prevYear, prevMonth);

    // Calculate totals by category
    const sumByCategory = (txList) => {
      const sums = {};
      FLEXIBLE_CATEGORIES.forEach((cat) => (sums[cat] = 0));
      txList.forEach((tx) => {
        if (sums[tx.budgetCategory] !== undefined) {
          sums[tx.budgetCategory] += tx.amount;
        }
      });
      return sums;
    };

    const currentSums = sumByCategory(currentMonthTx);
    const prevSums = sumByCategory(prevMonthTx);

    // Calculate differences
    const categoryDiffs = FLEXIBLE_CATEGORIES.map((cat) => {
      const current = currentSums[cat];
      const prev = prevSums[cat];
      const diff = current - prev;
      const percentChange = prev > 0 ? ((diff / prev) * 100) : (current > 0 ? 100 : 0);

      return {
        category: cat,
        current,
        previous: prev,
        diff,
        percentChange,
      };
    }).filter((c) => c.current > 0 || c.previous > 0); // Only show categories with activity

    // Overall totals
    const currentTotal = Object.values(currentSums).reduce((a, b) => a + b, 0);
    const prevTotal = Object.values(prevSums).reduce((a, b) => a + b, 0);
    const totalDiff = currentTotal - prevTotal;

    // Previous month label
    const prevMonthLabel = new Date(prevYear, prevMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return {
      categories: categoryDiffs,
      currentTotal,
      prevTotal,
      totalDiff,
      prevMonthLabel,
      hasPrevData: prevTotal > 0,
    };
  }, [transactions, selectedMonth]);

  if (!comparison.hasPrevData) {
    return (
      <div className="bg-background-card rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-text">Month Comparison</h2>
        <p className="text-sm text-text-muted mt-2">
          No data from previous month to compare
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">vs Last Month</h2>
          <p className="text-sm text-text-muted">
            {monthLabel} vs {comparison.prevMonthLabel}
          </p>
        </div>

        {/* Overall change badge */}
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            comparison.totalDiff <= 0
              ? 'bg-success/20 text-success'
              : 'bg-warning/20 text-warning'
          }`}
        >
          {comparison.totalDiff <= 0 ? '↓' : '↑'}{' '}
          {formatCurrency(Math.abs(comparison.totalDiff))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {comparison.categories.map(({ category, current, previous, diff }) => (
          <div
            key={category}
            className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
          >
            <span className="text-text text-sm">{category}</span>
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-sm">
                {formatCurrency(current)}
              </span>
              {diff !== 0 && (
                <span
                  className={`text-xs font-medium ${
                    diff < 0 ? 'text-success' : 'text-warning'
                  }`}
                >
                  {diff < 0 ? '↓' : '↑'} {formatCurrency(Math.abs(diff))}
                </span>
              )}
              {diff === 0 && previous > 0 && (
                <span className="text-xs text-text-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Total Flexible</span>
          <div className="text-right">
            <span className="text-text font-semibold">
              {formatCurrency(comparison.currentTotal)}
            </span>
            <span className="text-text-muted text-sm ml-2">
              (was {formatCurrency(comparison.prevTotal)})
            </span>
          </div>
        </div>
        {comparison.totalDiff < 0 && (
          <p className="text-success text-xs mt-2">
            You&apos;re spending {formatCurrency(Math.abs(comparison.totalDiff))} less than last month
          </p>
        )}
        {comparison.totalDiff > 0 && (
          <p className="text-warning text-xs mt-2">
            You&apos;re spending {formatCurrency(comparison.totalDiff)} more than last month
          </p>
        )}
      </div>
    </div>
  );
}

export default MonthComparison;
