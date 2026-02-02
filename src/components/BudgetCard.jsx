import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Weekly/Monthly budget overview card with pacing indicator
 * The key feature that shows "Day X of Y: Spent Z%, expected W%"
 * Now includes weekly rollover budget tracking
 */
export function BudgetCard({
  title = 'Monthly Budget',
  spent,
  budget,
  dayOfMonth,
  daysInMonth,
  paceStatus,
  weeklyRollover,
  enableRollover,
  toggleRollover,
}) {
  // Status icons and colors - ADHD-friendly compassionate copy
  const statusConfig = {
    under: {
      icon: '🔥',
      label: 'Crushing it!',
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    'on-pace': {
      icon: '✓',
      label: 'Right on track',
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    },
    over: {
      icon: '→',
      label: 'Spending fast',
      colorClass: 'text-danger',
      bgClass: 'bg-danger/10',
    },
  };

  const status = statusConfig[paceStatus.status] || statusConfig['on-pace'];

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg card-interactive">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${status.bgClass} ${status.colorClass}`}
        >
          <span>{status.icon}</span>
          <span>{status.label}</span>
        </div>
      </div>

      {/* Amount display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text">
            {formatCurrency(spent)}
          </span>
          <span className="text-text-muted">
            / {formatCurrency(budget)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={spent}
        max={budget}
        showPercentage={true}
        size="lg"
        className="mb-4"
      />

      {/* Weekly Rollover Section */}
      {weeklyRollover && enableRollover && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text">
              Week {weeklyRollover.currentWeek} Budget
            </span>
            {weeklyRollover.hasRollover && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  weeklyRollover.rolloverType === 'surplus'
                    ? 'bg-success/20 text-success'
                    : 'bg-danger/20 text-danger'
                }`}
              >
                {weeklyRollover.rolloverType === 'surplus' ? '+' : '-'}
                {formatCurrency(weeklyRollover.rolloverAmount)} rollover
              </span>
            )}
          </div>

          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl font-bold text-text">
                {formatCurrency(weeklyRollover.remainingThisWeek)}
              </span>
              <span className="text-text-muted text-sm ml-1">left this week</span>
            </div>
          </div>

          <div className="mt-2 flex justify-between text-xs text-text-muted">
            <span>
              Base: {formatCurrency(weeklyRollover.baseWeeklyBudget)}
            </span>
            <span>
              Effective: {formatCurrency(weeklyRollover.effectiveBudgetThisWeek)}
            </span>
          </div>

          {/* Mini progress for this week */}
          <div className="mt-2">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  weeklyRollover.spentThisWeek > weeklyRollover.effectiveBudgetThisWeek
                    ? 'bg-danger'
                    : weeklyRollover.spentThisWeek > weeklyRollover.effectiveBudgetThisWeek * 0.8
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                style={{
                  width: `${Math.min(
                    (weeklyRollover.spentThisWeek / weeklyRollover.effectiveBudgetThisWeek) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rollover toggle */}
      {toggleRollover && (
        <button
          onClick={toggleRollover}
          className="w-full mb-4 py-2 px-3 text-xs text-text-muted hover:text-text bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span
            className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
              enableRollover ? 'border-accent bg-accent' : 'border-gray-500'
            }`}
          >
            {enableRollover && (
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          Weekly rollover {enableRollover ? 'on' : 'off'}
        </button>
      )}

      {/* Pacing indicator - THE KEY FEATURE */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="text-sm text-text-muted mb-1">
          Day {dayOfMonth} of {daysInMonth}
        </div>
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-text-muted">Expected: </span>
            <span className="text-text font-medium">{paceStatus.expectedPercentage}%</span>
          </div>
          <div>
            <span className="text-text-muted">Actual: </span>
            <span className={`font-medium ${status.colorClass}`}>
              {paceStatus.percentage}%
            </span>
          </div>
        </div>

        {/* Difference callout - compassionate messaging */}
        {paceStatus.difference !== 0 && (
          <div className={`mt-2 text-sm ${status.colorClass}`}>
            {paceStatus.difference > 0
              ? `${paceStatus.difference}% ahead—plenty of month left`
              : `${Math.abs(paceStatus.difference)}% under pace—nice work! 💪`}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetCard;
