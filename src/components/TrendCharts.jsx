import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/budgetCalculations';
import { FLEXIBLE_CATEGORIES, shouldExcludeTransaction } from '../utils/categoryMapper';

/**
 * Custom tooltip for charts
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-text-muted text-sm mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text">{entry.name}:</span>
          <span className="text-text font-medium">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Spending trend chart - shows monthly spending by category
 */
export function SpendingTrendChart({ transactions, months = 6 }) {
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });

      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      // Filter transactions for this month
      const monthTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate >= monthStart &&
          txDate <= monthEnd &&
          !shouldExcludeTransaction(tx)
        );
      });

      // Calculate spending by category
      const categorySpending = {};
      FLEXIBLE_CATEGORIES.forEach((cat) => {
        categorySpending[cat] = 0;
      });

      monthTxs.forEach((tx) => {
        const budgetCat = tx.budgetCategory || 'Uncategorized';
        if (FLEXIBLE_CATEGORIES.includes(budgetCat)) {
          categorySpending[budgetCat] += tx.amount;
        }
      });

      const total = Object.values(categorySpending).reduce((a, b) => a + b, 0);

      data.push({
        month: monthKey,
        ...categorySpending,
        Total: total,
      });
    }

    return data;
  }, [transactions, months]);

  const categoryColors = {
    Groceries: '#22c55e',
    Dining: '#f97316',
    Discretionary: '#a855f7',
    Travel: '#3b82f6',
    Dates: '#ec4899',
  };

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-text mb-4">
        Spending Trends
      </h3>
      <p className="text-sm text-text-muted mb-4">
        Monthly flexible spending by category
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span style={{ color: '#e8e8e8', fontSize: '12px' }}>{value}</span>
              )}
            />
            {FLEXIBLE_CATEGORIES.map((cat) => (
              <Area
                key={cat}
                type="monotone"
                dataKey={cat}
                stackId="1"
                stroke={categoryColors[cat]}
                fill={categoryColors[cat]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly totals */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-muted">Latest month total:</span>
          <span className="text-text font-semibold">
            {formatCurrency(chartData[chartData.length - 1]?.Total || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Debt trend chart - shows debt balance over time
 * Uses historical snapshots if available, otherwise interpolates
 */
export function DebtTrendChart({ debtStats, debtHistory = [] }) {
  const chartData = useMemo(() => {
    const data = [];
    const { septemberPeak, currentTargetDebt, targetDebtPaidOff } = debtStats;

    // Generate monthly data from September 2025 to now
    const startDate = new Date(2025, 8, 1); // September 2025
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());

    // Create a map of historical balances by month key
    const historyMap = {};
    debtHistory.forEach((snapshot) => {
      const date = new Date(snapshot.date);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      // Use the latest snapshot for each month
      historyMap[monthKey] = snapshot.totalTargetDebt;
    });

    // Calculate average monthly payoff for interpolation/projection
    const avgMonthlyPayoff = targetDebtPaidOff / Math.max(monthsDiff, 1);

    for (let i = 0; i <= monthsDiff; i++) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthKey = monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });

      // Use historical data if available, otherwise interpolate
      let balance;
      if (historyMap[monthKey] !== undefined) {
        balance = historyMap[monthKey];
      } else if (i === 0) {
        balance = septemberPeak;
      } else if (i === monthsDiff) {
        balance = currentTargetDebt;
      } else {
        // Linear interpolation for months without history
        balance = Math.max(0, septemberPeak - avgMonthlyPayoff * i);
      }

      data.push({
        month: monthKey,
        balance: Math.round(balance),
      });
    }

    // Update last point with actual current balance
    if (data.length > 0) {
      data[data.length - 1].balance = currentTargetDebt;
    }

    // Add projection to May 2026
    const targetDate = new Date(2026, 4, 1); // May 2026
    const monthsToTarget =
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth());

    for (let i = 1; i <= monthsToTarget; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });

      const projectedBalance = Math.max(0, currentTargetDebt - avgMonthlyPayoff * i);

      data.push({
        month: monthKey,
        balance: null,
        projected: Math.round(projectedBalance),
      });
    }

    return data;
  }, [debtStats, debtHistory]);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-text mb-4">
        Debt Payoff Progress
      </h3>
      <p className="text-sm text-text-muted mb-4">
        Credit card balance over time
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span style={{ color: '#e8e8e8', fontSize: '12px' }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Actual Balance"
              stroke="#06d6a0"
              strokeWidth={3}
              dot={{ fill: '#06d6a0', strokeWidth: 0, r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="#4361ee"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Progress summary */}
      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-text-muted text-xs">Peak (Sep '25)</div>
          <div className="text-text font-semibold">
            {formatCurrency(debtStats.septemberPeak)}
          </div>
        </div>
        <div>
          <div className="text-text-muted text-xs">Current</div>
          <div className="text-success font-semibold">
            {formatCurrency(debtStats.currentTargetDebt)}
          </div>
        </div>
        <div>
          <div className="text-text-muted text-xs">Paid Off</div>
          <div className="text-success font-semibold">
            {formatCurrency(debtStats.targetDebtPaidOff)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Category comparison bar chart
 */
export function CategoryComparisonChart({ categorySpending, categoryBudgets }) {
  const chartData = useMemo(() => {
    return Object.keys(categoryBudgets).map((category) => ({
      category,
      spent: categorySpending[category] || 0,
      budget: categoryBudgets[category],
    }));
  }, [categorySpending, categoryBudgets]);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-text mb-4">
        Budget vs Actual
      </h3>
      <p className="text-sm text-text-muted mb-4">
        This month's spending compared to budget
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span style={{ color: '#e8e8e8', fontSize: '12px' }}>{value}</span>
              )}
            />
            <Bar dataKey="budget" name="Budget" fill="#4361ee" opacity={0.4} radius={[0, 4, 4, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#06d6a0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingTrendChart;
