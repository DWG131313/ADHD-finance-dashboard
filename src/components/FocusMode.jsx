import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Get time-based greeting
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Bi-weekly paycheck configuration
 */
const PAYCHECK_CONFIG = {
  amount: 5100,
  anchorDate: new Date('2026-01-30'),
  intervalDays: 14,
};

/**
 * Calculate the next paycheck date from today
 */
function getNextPaycheck() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const anchor = new Date(PAYCHECK_CONFIG.anchorDate);
  anchor.setHours(0, 0, 0, 0);
  const interval = PAYCHECK_CONFIG.intervalDays;

  const daysDiff = Math.floor((today - anchor) / (1000 * 60 * 60 * 24));
  const periodsFromAnchor = Math.ceil(daysDiff / interval);
  const nextPayday = new Date(anchor);
  nextPayday.setDate(anchor.getDate() + periodsFromAnchor * interval);

  if (nextPayday < today) {
    nextPayday.setDate(nextPayday.getDate() + interval);
  }

  const daysUntil = Math.ceil((nextPayday - today) / (1000 * 60 * 60 * 24));

  return {
    date: nextPayday,
    daysUntil,
    amount: PAYCHECK_CONFIG.amount,
    formattedDate: nextPayday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

/**
 * Get the next upcoming bill
 */
function getNextBill() {
  const bills = [
    { name: 'Rent', amount: 3675, dayOfMonth: 2 },
    { name: 'Lending Club', amount: 609, dayOfMonth: 4 },
    { name: 'Comcast', amount: 103, dayOfMonth: 4 },
    { name: 'PSE', amount: 80, dayOfMonth: 13 },
    { name: 'Student Loan', amount: 577.82, dayOfMonth: 14 },
    { name: 'Pet Insurance', amount: 137.36, dayOfMonth: 15 },
    { name: 'Car Insurance', amount: 123.93, dayOfMonth: 16 },
    { name: 'AT&T', amount: 112, dayOfMonth: 30 },
  ];

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Find bills remaining this month
  let nextBill = bills.find(bill => bill.dayOfMonth > currentDay);

  // If no more bills this month, get first bill of next month
  if (!nextBill) {
    nextBill = bills.reduce((min, bill) =>
      bill.dayOfMonth < min.dayOfMonth ? bill : min, bills[0]);
    const nextMonth = currentMonth + 1;
    const billDate = new Date(currentYear, nextMonth, nextBill.dayOfMonth);
    const daysUntil = Math.ceil((billDate - today) / (1000 * 60 * 60 * 24));
    return { ...nextBill, daysUntil, formattedDate: billDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  }

  const billDate = new Date(currentYear, currentMonth, nextBill.dayOfMonth);
  const daysUntil = Math.ceil((billDate - today) / (1000 * 60 * 60 * 24));

  return {
    ...nextBill,
    daysUntil,
    formattedDate: billDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

/**
 * Quick balance update input
 */
function QuickBalanceUpdate({ debts, onUpdateBalance, onClose }) {
  const [balances, setBalances] = useState(() => {
    const initial = {};
    debts.forEach(debt => {
      initial[debt.id] = debt.currentBalance.toString();
    });
    return initial;
  });

  const handleSave = () => {
    Object.entries(balances).forEach(([id, value]) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onUpdateBalance(id, numValue);
      }
    });
    onClose();
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-text-muted">Quick Balance Update</h3>
      {debts.filter(d => d.currentBalance > 0).map(debt => (
        <div key={debt.id} className="flex items-center gap-3">
          <span className="text-sm text-text flex-1 truncate">{debt.name}</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input
              type="number"
              value={balances[debt.id]}
              onChange={(e) => setBalances(prev => ({ ...prev, [debt.id]: e.target.value }))}
              className="w-28 pl-6 pr-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-text text-right text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-gray-700 text-text rounded-lg text-sm hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Focus Mode - Simplified dashboard for quick daily checks
 * ADHD UX: Reduces cognitive load to absolute essentials
 */
export function FocusMode({
  // Budget data
  totalFlexibleSpending,
  totalMonthlyBudget,
  monthlyPaceStatus,
  monthInfo,
  // Debt data
  debtStats,
  debts = [],
  updateDebtBalance,
  // Streak data
  streaks = {},
  // Rollover data
  weeklyRollover,
  enableRollover,
  toggleRollover,
  // Actions
  onExitFocusMode,
}) {
  const [showBalanceUpdate, setShowBalanceUpdate] = useState(false);
  const [budgetView, setBudgetView] = useState('daily'); // 'daily' or 'weekly'

  const {
    targetDebtPaidOff,
    targetPayoffPercentage,
    currentTargetDebt,
    targetPayoffDate,
  } = debtStats;

  // Time-based greeting
  const greeting = useMemo(() => getGreeting(), []);

  // Paycheck info
  const nextPaycheck = useMemo(() => getNextPaycheck(), []);

  // Next bill info
  const nextBill = useMemo(() => getNextBill(), []);

  // Calculate daily and weekly budget remaining
  const budgetInfo = useMemo(() => {
    const remaining = totalMonthlyBudget - totalFlexibleSpending;
    const daysLeft = monthInfo.daysInMonth - monthInfo.dayOfMonth + 1;
    const weeksLeft = daysLeft / 7;
    const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;
    const weeklyBudget = weeksLeft > 0 ? remaining / weeksLeft : 0;

    return {
      remaining,
      daysLeft,
      dailyBudget,
      weeklyBudget,
      isPositive: remaining > 0,
    };
  }, [totalMonthlyBudget, totalFlexibleSpending, monthInfo]);

  // Days until payoff
  const daysUntilPayoff = useMemo(() => {
    if (!targetPayoffDate) return null;
    const today = new Date();
    const target = new Date(targetPayoffDate);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }, [targetPayoffDate]);

  // Status config for display
  const statusConfig = {
    under: {
      emoji: '🔥',
      label: 'Crushing it!',
      colorClass: 'text-success',
      bgClass: 'bg-success/20',
    },
    'on-pace': {
      emoji: '✓',
      label: 'On track',
      colorClass: 'text-warning',
      bgClass: 'bg-warning/20',
    },
    over: {
      emoji: '⚡',
      label: 'Spending fast',
      colorClass: 'text-danger',
      bgClass: 'bg-danger/20',
    },
  };

  const status = statusConfig[monthlyPaceStatus.status] || statusConfig['on-pace'];

  // Current streak
  const currentStreak = streaks.underBudget || 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Focus Mode Card */}
        <div className="bg-background-card rounded-2xl p-6 shadow-2xl">
          {/* Header with greeting */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-text mb-1">{greeting}</h1>
            <p className="text-sm text-text-muted">
              {monthInfo.label} · Day {monthInfo.dayOfMonth} of {monthInfo.daysInMonth}
            </p>
          </div>

          {/* Budget Toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setBudgetView('daily')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  budgetView === 'daily'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setBudgetView('weekly')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  budgetView === 'weekly'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Budget Display - Primary Focus */}
          <div className="text-center mb-4">
            {budgetView === 'weekly' && weeklyRollover && enableRollover ? (
              // Show rollover-adjusted weekly budget
              <>
                <div className={`text-5xl font-bold mb-1 ${weeklyRollover.remainingThisWeek >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(Math.abs(weeklyRollover.remainingThisWeek))}
                </div>
                <div className="text-text-muted">
                  {weeklyRollover.remainingThisWeek >= 0 ? 'left' : 'over'} this week
                </div>
                {weeklyRollover.hasRollover && (
                  <div className={`mt-1 text-xs ${weeklyRollover.rolloverType === 'surplus' ? 'text-success' : 'text-danger'}`}>
                    {weeklyRollover.rolloverType === 'surplus' ? '+' : '-'}
                    {formatCurrency(weeklyRollover.rolloverAmount)} rollover from previous weeks
                  </div>
                )}
              </>
            ) : (
              // Standard daily/weekly view
              <>
                <div className={`text-5xl font-bold mb-1 ${budgetInfo.isPositive ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(Math.abs(budgetView === 'daily' ? budgetInfo.dailyBudget : budgetInfo.weeklyBudget))}
                </div>
                <div className="text-text-muted">
                  {budgetInfo.isPositive ? 'remaining' : 'over'} per {budgetView === 'daily' ? 'day' : 'week'}
                </div>
              </>
            )}
          </div>

          {/* Status Pill + Streak */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className={`px-4 py-2 rounded-full ${status.bgClass}`}>
              <span className="text-lg mr-2">{status.emoji}</span>
              <span className={`font-medium ${status.colorClass}`}>{status.label}</span>
            </div>
            {currentStreak > 0 && (
              <div className="px-3 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium">
                {currentStreak} week streak
              </div>
            )}
          </div>

          {/* Upcoming: Paycheck & Bill */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-success/10 rounded-xl p-3 text-center">
              <div className="text-xs text-success font-medium mb-1">NEXT PAYDAY</div>
              <div className="text-lg font-bold text-success">
                {nextPaycheck.daysUntil === 0 ? 'Today!' : `${nextPaycheck.daysUntil}d`}
              </div>
              <div className="text-xs text-text-muted">{nextPaycheck.formattedDate}</div>
            </div>
            <div className="bg-orange-500/10 rounded-xl p-3 text-center">
              <div className="text-xs text-orange-400 font-medium mb-1">NEXT BILL</div>
              <div className="text-lg font-bold text-orange-400">
                {nextBill.daysUntil === 0 ? 'Today!' : `${nextBill.daysUntil}d`}
              </div>
              <div className="text-xs text-text-muted">{nextBill.name}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-5" />

          {/* Debt Progress - Cleaner design */}
          <div className="mb-5">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-text-muted">Debt Freedom Progress</span>
              <span className="text-sm font-medium text-success">{Math.round(targetPayoffPercentage)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(targetPayoffPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-success font-medium">{formatCurrency(targetDebtPaidOff)} paid</span>
              <span className="text-text-muted">{formatCurrency(currentTargetDebt)} to go</span>
            </div>
          </div>

          {/* Payoff countdown */}
          {daysUntilPayoff && daysUntilPayoff > 0 && (
            <div className="text-center mb-5 py-3 bg-gray-800/50 rounded-xl">
              <div className="text-2xl font-bold text-text">
                {Math.floor(daysUntilPayoff / 30)} months, {daysUntilPayoff % 30} days
              </div>
              <div className="text-sm text-text-muted">until debt freedom</div>
            </div>
          )}

          {/* Quick Balance Update */}
          {showBalanceUpdate ? (
            <QuickBalanceUpdate
              debts={debts}
              onUpdateBalance={updateDebtBalance}
              onClose={() => setShowBalanceUpdate(false)}
            />
          ) : (
            /* Action Buttons */
            <div className="flex gap-3">
              <button
                onClick={() => setShowBalanceUpdate(true)}
                className="flex-1 py-3 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors btn-interactive"
              >
                Update Balances
              </button>
              <button
                onClick={onExitFocusMode}
                className="flex-1 py-3 px-4 bg-gray-700 text-text rounded-lg font-medium hover:bg-gray-600 transition-colors btn-interactive"
              >
                Full Dashboard
              </button>
            </div>
          )}

          {/* Keyboard hint */}
          <p className="text-center text-xs text-text-muted mt-4">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-text">F</kbd> to toggle focus mode
          </p>
        </div>

        {/* Budget Details (collapsed by default) */}
        <details className="mt-4">
          <summary className="text-center text-sm text-text-muted cursor-pointer hover:text-text">
            View budget breakdown
          </summary>
          <div className="bg-background-card rounded-xl p-4 mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Monthly budget</span>
              <span className="text-text">{formatCurrency(totalMonthlyBudget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Spent so far</span>
              <span className="text-text">{formatCurrency(totalFlexibleSpending)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Remaining</span>
              <span className={budgetInfo.isPositive ? 'text-success' : 'text-danger'}>
                {formatCurrency(budgetInfo.remaining)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Days left</span>
              <span className="text-text">{budgetInfo.daysLeft}</span>
            </div>
            <div className="border-t border-gray-700 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Daily budget</span>
              <span className={budgetInfo.isPositive ? 'text-success' : 'text-danger'}>
                {formatCurrency(budgetInfo.dailyBudget)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Weekly budget</span>
              <span className={budgetInfo.isPositive ? 'text-success' : 'text-danger'}>
                {formatCurrency(budgetInfo.weeklyBudget)}
              </span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default FocusMode;
