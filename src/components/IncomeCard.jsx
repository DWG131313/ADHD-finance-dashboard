import { useState, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Income summary card showing paychecks, extra income, and net position
 */
export function IncomeCard({
  monthlyIncome,
  totalSpending,
  monthLabel,
  onAddExtraIncome,
  onRemoveExtraIncome,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const {
    paycheckCount,
    paycheckAmount,
    paycheckTotal,
    payDates,
    extraIncome,
    extraTotal,
    totalIncome,
  } = monthlyIncome;

  const netPosition = totalIncome - totalSpending;
  const isPositive = netPosition >= 0;

  // Calculate next payday countdown
  const paydayCountdown = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find the next pay date (could be in current month or future)
    const upcomingPayDates = payDates
      .filter((d) => d >= today)
      .sort((a, b) => a - b);

    if (upcomingPayDates.length === 0) {
      // No more pay dates this month, estimate next one (14 days from last)
      const lastPayDate = payDates[payDates.length - 1];
      if (lastPayDate) {
        const nextPayDate = new Date(lastPayDate);
        nextPayDate.setDate(nextPayDate.getDate() + 14);
        return {
          daysUntil: differenceInDays(nextPayDate, today),
          date: nextPayDate,
          isNextMonth: true,
        };
      }
      return null;
    }

    const nextPayDate = upcomingPayDates[0];
    return {
      daysUntil: differenceInDays(nextPayDate, today),
      date: nextPayDate,
      isNextMonth: false,
    };
  }, [payDates]);

  const handleAddIncome = () => {
    const amount = parseFloat(newAmount);
    if (amount > 0 && newDescription.trim()) {
      onAddExtraIncome({
        amount,
        description: newDescription.trim(),
      });
      setNewAmount('');
      setNewDescription('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Monthly Income</h2>
          <p className="text-sm text-text-muted">{monthLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-success">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-xs text-text-muted">total income</div>
        </div>
      </div>

      {/* Paychecks */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-text font-medium">Paychecks</span>
            <span className="text-text-muted text-sm ml-2">
              ({paycheckCount} × {formatCurrency(paycheckAmount)})
            </span>
          </div>
          <span className="text-success font-medium">
            {formatCurrency(paycheckTotal)}
          </span>
        </div>
        {payDates.length > 0 && (
          <div className="mt-2 text-xs text-text-muted">
            Pay dates:{' '}
            {payDates.map((d, i) => (
              <span key={i}>
                {i > 0 && ', '}
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        )}

        {/* Payday Countdown - ADHD UX feature */}
        {paydayCountdown && (
          <div className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-accent">
                  {paydayCountdown.daysUntil}
                </span>
                <span className="text-sm text-text-muted">
                  {paydayCountdown.daysUntil === 1 ? 'day' : 'days'} until payday
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {paydayCountdown.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            {paydayCountdown.daysUntil === 0 && (
              <div className="text-sm text-success font-medium mt-1">
                🎉 Payday today!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra Income */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text font-medium">Extra Income</span>
          <span className="text-success font-medium">
            {formatCurrency(extraTotal)}
          </span>
        </div>

        {extraIncome.length > 0 ? (
          <div className="space-y-2">
            {extraIncome.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center text-sm bg-gray-700/50 rounded px-2 py-1"
              >
                <span className="text-text-muted">{entry.description}</span>
                <div className="flex items-center gap-2">
                  <span className="text-success">{formatCurrency(entry.amount)}</span>
                  <button
                    onClick={() => onRemoveExtraIncome(entry.id)}
                    className="text-text-muted hover:text-danger transition-colors"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted">No extra income recorded</p>
        )}

        {/* Add extra income form */}
        {showAddForm ? (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Description (e.g., Stock sale)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-text text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-text text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleAddIncome}
                className="px-3 py-2 bg-success text-white rounded text-sm font-medium hover:bg-success/80 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewAmount('');
                  setNewDescription('');
                }}
                className="px-3 py-2 bg-gray-600 text-text rounded text-sm hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 w-full py-2 border border-dashed border-gray-600 rounded text-text-muted text-sm hover:border-accent hover:text-accent transition-colors"
          >
            + Add stock sale, bonus, or other income
          </button>
        )}
      </div>

      {/* Net Position */}
      <div className="border-t border-gray-700 pt-3 mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-muted">Total Income</span>
          <span className="text-success font-medium">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-muted">Total Spending</span>
          <span className="text-danger font-medium">-{formatCurrency(totalSpending)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-text font-medium">Net Position</span>
          <span
            className={`text-xl font-bold ${
              isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {isPositive ? '+' : ''}{formatCurrency(netPosition)}
          </span>
        </div>

        {/* Context message */}
        <p className="text-xs text-text-muted mt-3">
          {isPositive
            ? `You have ${formatCurrency(netPosition)} available for debt payoff or savings.`
            : `You've spent ${formatCurrency(Math.abs(netPosition))} more than your income this month.`}
        </p>
      </div>
    </div>
  );
}

export default IncomeCard;
