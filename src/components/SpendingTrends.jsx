import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background-card border border-gray-600 rounded-lg p-3 shadow-lg">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

/**
 * Spending trends chart showing cumulative daily spending vs budget pace
 */
export function SpendingTrends({
  transactions,
  totalBudget,
  selectedMonth,
  monthLabel,
}) {
  // Build daily cumulative spending data
  const chartData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

    // Filter transactions for this month that count toward budget
    const monthTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === year &&
        txDate.getMonth() === month &&
        tx.type !== 'income' &&
        !tx.excluded
      );
    });

    // Group spending by day
    const dailySpending = {};
    monthTransactions.forEach((tx) => {
      const day = new Date(tx.date).getDate();
      dailySpending[day] = (dailySpending[day] || 0) + tx.amount;
    });

    // Build cumulative data for each day
    const data = [];
    let cumulative = 0;
    const dailyBudgetPace = totalBudget / daysInMonth;

    for (let day = 1; day <= daysInMonth; day++) {
      cumulative += dailySpending[day] || 0;
      const expectedPace = dailyBudgetPace * day;

      // Only show actual spending up to current day (or all days if past month)
      const isPastOrToday = day <= currentDay;

      data.push({
        day,
        label: `${month + 1}/${day}`,
        actual: isPastOrToday ? cumulative : null,
        pace: expectedPace,
        budget: totalBudget,
      });
    }

    return data;
  }, [transactions, totalBudget, selectedMonth]);

  // Calculate status message
  const statusMessage = useMemo(() => {
    const today = new Date();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;

    if (!isCurrentMonth) {
      const lastDay = chartData[chartData.length - 1];
      if (lastDay && lastDay.actual !== null) {
        const diff = lastDay.pace - lastDay.actual;
        if (diff > 0) {
          return { text: `Finished ${formatCurrency(diff)} under budget`, color: 'text-success' };
        } else if (diff < 0) {
          return { text: `Finished ${formatCurrency(Math.abs(diff))} over budget`, color: 'text-danger' };
        }
      }
      return null;
    }

    const currentDay = today.getDate();
    const todayData = chartData.find((d) => d.day === currentDay);
    if (!todayData || todayData.actual === null) return null;

    const diff = todayData.pace - todayData.actual;
    if (diff > 0) {
      return { text: `${formatCurrency(diff)} ahead of pace`, color: 'text-success' };
    } else if (diff < 0) {
      return { text: `${formatCurrency(Math.abs(diff))} behind pace`, color: 'text-warning' };
    }
    return { text: 'Right on pace', color: 'text-text' };
  }, [chartData, selectedMonth]);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Spending Pace</h2>
          <p className="text-sm text-text-muted">{monthLabel}</p>
        </div>
        {statusMessage && (
          <div className={`text-sm font-medium ${statusMessage.color}`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Budget line */}
            <ReferenceLine
              y={totalBudget}
              stroke="#ef476f"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* Expected pace line */}
            <Line
              type="monotone"
              dataKey="pace"
              name="Budget Pace"
              stroke="#4361ee"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
            />

            {/* Actual spending line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#06d6a0"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-success"></div>
          <span className="text-text-muted">Actual Spending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-accent" style={{ borderStyle: 'dashed' }}></div>
          <span className="text-text-muted">Budget Pace</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-danger" style={{ borderStyle: 'dashed' }}></div>
          <span className="text-text-muted">Budget Limit</span>
        </div>
      </div>
    </div>
  );
}

export default SpendingTrends;
