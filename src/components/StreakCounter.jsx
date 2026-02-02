/**
 * Streak display component
 * ADHD UX: Visual representation of consistency builds motivation
 */
export function StreakCounter({ streaks, hasUpdatedThisWeek, wasUnderBudgetThisWeek }) {
  const { budget, update } = streaks;

  // Determine which streak to highlight
  const showBudgetStreak = budget.current > 0 || wasUnderBudgetThisWeek;
  const showUpdateStreak = update.current > 0;

  if (!showBudgetStreak && !showUpdateStreak) {
    return (
      <div className="bg-background-card rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-text mb-3">Streaks</h2>
        <p className="text-sm text-text-muted">
          Start building streaks! Stay under budget or update your balances weekly.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-text-muted">Budget Streak</div>
            <div className="text-lg font-bold text-text-muted">0</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">✏️</div>
            <div className="text-xs text-text-muted">Update Streak</div>
            <div className="text-lg font-bold text-text-muted">0</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-text mb-3">Streaks</h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Budget Streak */}
        <div
          className={`rounded-lg p-3 text-center transition-all ${
            budget.current > 0
              ? 'bg-success/10 border border-success/30'
              : 'bg-gray-800/50'
          }`}
        >
          <div className="text-2xl mb-1">
            {budget.current >= 4 ? '🔥' : budget.current > 0 ? '📊' : '📊'}
          </div>
          <div className="text-xs text-text-muted mb-1">Budget Streak</div>
          <div
            className={`text-2xl font-bold ${
              budget.current > 0 ? 'text-success' : 'text-text-muted'
            }`}
          >
            {budget.current}
          </div>
          <div className="text-xs text-text-muted">
            {budget.current === 1 ? 'week' : 'weeks'}
          </div>
          {budget.best > budget.current && (
            <div className="text-xs text-text-muted mt-1">
              Best: {budget.best}
            </div>
          )}
        </div>

        {/* Update Streak */}
        <div
          className={`rounded-lg p-3 text-center transition-all ${
            update.current > 0
              ? 'bg-accent/10 border border-accent/30'
              : 'bg-gray-800/50'
          }`}
        >
          <div className="text-2xl mb-1">
            {update.current >= 4 ? '⚡' : update.current > 0 ? '✏️' : '✏️'}
          </div>
          <div className="text-xs text-text-muted mb-1">Update Streak</div>
          <div
            className={`text-2xl font-bold ${
              update.current > 0 ? 'text-accent' : 'text-text-muted'
            }`}
          >
            {update.current}
          </div>
          <div className="text-xs text-text-muted">
            {update.current === 1 ? 'week' : 'weeks'}
          </div>
          {update.best > update.current && (
            <div className="text-xs text-text-muted mt-1">
              Best: {update.best}
            </div>
          )}
        </div>
      </div>

      {/* This week status */}
      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs">
        <div className="flex items-center gap-1">
          {wasUnderBudgetThisWeek ? (
            <>
              <span className="text-success">✓</span>
              <span className="text-text-muted">Under budget this week</span>
            </>
          ) : (
            <span className="text-text-muted">Stay under budget to extend streak</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasUpdatedThisWeek ? (
            <>
              <span className="text-accent">✓</span>
              <span className="text-text-muted">Updated</span>
            </>
          ) : (
            <span className="text-warning">Update balances!</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreakCounter;
