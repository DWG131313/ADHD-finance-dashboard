import { useState, useMemo, useEffect } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { PayoffCountdown } from './PayoffCountdown';

/**
 * Milestone markers on the progress bar
 */
function MilestoneMarkers({ milestones }) {
  return (
    <>
      {milestones.map((milestone) => (
        <div
          key={milestone.threshold}
          className="absolute top-0 bottom-0 flex flex-col items-center z-0"
          style={{ left: `${milestone.threshold}%`, transform: 'translateX(-50%)' }}
        >
          {/* Marker line - thin tick mark */}
          <div
            className={`w-0.5 h-full ${
              milestone.reached ? 'bg-white/30' : 'bg-gray-500/50'
            }`}
          />
          {/* Milestone indicator below */}
          <div
            className={`absolute -bottom-5 text-[10px] font-medium whitespace-nowrap z-20 ${
              milestone.reached ? 'text-success' : 'text-text-muted'
            }`}
          >
            {milestone.threshold === 100 ? '🎉' : `${milestone.threshold}%`}
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Celebration overlay for reaching milestones
 */
function MilestoneCelebration({ milestone, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getEmoji = (threshold) => {
    switch (threshold) {
      case 25: return '🌱';
      case 50: return '🔥';
      case 75: return '💪';
      case 100: return '🎉';
      default: return '✨';
    }
  };

  const getMessage = (threshold) => {
    switch (threshold) {
      case 25: return "You're making progress!";
      case 50: return "Halfway there! Keep going!";
      case 75: return "The finish line is in sight!";
      case 100: return "You did it! DEBT FREE!";
      default: return "Great progress!";
    }
  };

  return (
    <div
      className="absolute inset-0 bg-success/20 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 animate-pulse cursor-pointer"
      onClick={onDismiss}
    >
      <div className="text-center p-6">
        <div className="text-5xl mb-3">{getEmoji(milestone.threshold)}</div>
        <div className="text-2xl font-bold text-success mb-1">
          {milestone.label}
        </div>
        <div className="text-text-muted text-sm">
          {getMessage(milestone.threshold)}
        </div>
        <div className="text-xs text-text-muted mt-3 opacity-75">
          Click to dismiss
        </div>
      </div>
    </div>
  );
}

/**
 * Next milestone progress indicator
 */
function NextMilestoneCard({ nextMilestone, currentPercentage }) {
  if (!nextMilestone) return null;

  const progressToNext = (currentPercentage / nextMilestone.threshold) * 100;

  return (
    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-accent font-medium">
          Next Milestone: {nextMilestone.label}
        </span>
        <span className="text-xs text-text-muted">
          {formatCurrency(nextMilestone.amountRemaining)} to go
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progressToNext, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Inline editable amount input
 */
function EditableBalance({ value, onChange, onBlur }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-text-muted">$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-28 px-2 py-1 bg-gray-700 border border-accent rounded text-text text-right font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
        step="0.01"
        min="0"
        autoFocus
      />
    </div>
  );
}

/**
 * Individual debt progress card
 */
function DebtCard({ debt, showTermInfo = false, isEditing = false, onBalanceChange }) {
  const [editValue, setEditValue] = useState(debt.current.toString());
  const percentagePaid = debt.percentagePaid;
  const remaining = debt.current;

  // Color based on progress
  let progressColor = debt.color || '#4361ee';

  const handleBlur = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0 && newValue !== debt.current) {
      onBalanceChange?.(debt.key, newValue);
    } else {
      setEditValue(debt.current.toString());
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 ${isEditing ? 'ring-1 ring-accent/50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-text font-medium">{debt.name}</h4>
          {debt.note && (
            <p className="text-xs text-text-muted mt-0.5">{debt.note}</p>
          )}
        </div>
        <div className="text-right">
          {isEditing ? (
            <EditableBalance
              value={editValue}
              onChange={setEditValue}
              onBlur={handleBlur}
            />
          ) : remaining > 0 ? (
            <>
              <span className="text-text font-semibold">
                {formatCurrency(remaining)}
              </span>
              <span className="text-text-muted text-sm"> left</span>
            </>
          ) : (
            <span className="text-success font-semibold">Paid Off! ✓</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentagePaid, 100)}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs text-text-muted">
        <span>
          {formatCurrency(debt.paidOff)} paid off
        </span>
        <span className="font-medium" style={{ color: progressColor }}>
          {Math.round(percentagePaid)}% complete
        </span>
      </div>

      {/* APR and payment info */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {debt.apr > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              debt.apr >= 20
                ? 'bg-danger/20 text-danger'
                : debt.apr >= 10
                ? 'bg-warning/20 text-warning'
                : 'bg-success/20 text-success'
            }`}
          >
            {debt.apr}% APR
          </span>
        )}
        
        {/* Show monthly payment if set */}
        {debt.monthlyPayment > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
            {formatCurrency(debt.monthlyPayment)}/mo
          </span>
        )}
        
        {showTermInfo && debt.monthsRemaining !== null && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-text-muted">
            {debt.monthsRemaining} months left
          </span>
        )}
      </div>
    </div>
  );
}


/**
 * Payoff projection display
 */
function PayoffProjection({ debtStats }) {
  const {
    projectedPayoff,
    targetPayoffDate,
    isOnTrack,
    avgMonthlyPayment,
    requiredMonthlyPayment,
    monthsToTarget,
  } = debtStats;

  // Format dates
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
      <h4 className="text-text font-medium mb-3">May 2026 Payoff Goal</h4>

      <div className="space-y-3">
        {/* Target date */}
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Target</span>
          <span className="text-text font-medium">
            {formatDate(targetPayoffDate)}
          </span>
        </div>

        {/* Projected date */}
        {projectedPayoff && (
          <div className="flex justify-between items-center">
            <span className="text-text-muted text-sm">Projected</span>
            <span
              className={`font-medium ${
                isOnTrack ? 'text-success' : 'text-warning'
              }`}
            >
              {formatDate(projectedPayoff)}
            </span>
          </div>
        )}

        {/* Status - compassionate messaging */}
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Status</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isOnTrack
                ? 'bg-success/20 text-success'
                : 'bg-warning/20 text-warning'
            }`}
          >
            {isOnTrack ? '🔥 On Track' : 'Needs a push'}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          {/* Average monthly payment */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-muted text-sm">Avg. monthly payment</span>
            <span className="text-text font-medium">
              {formatCurrency(avgMonthlyPayment)}
            </span>
          </div>

          {/* Required payment */}
          <div className="flex justify-between items-center">
            <span className="text-text-muted text-sm">
              Required for May 2026
            </span>
            <span
              className={`font-medium ${
                avgMonthlyPayment >= requiredMonthlyPayment
                  ? 'text-success'
                  : 'text-warning'
              }`}
            >
              {formatCurrency(requiredMonthlyPayment)}/mo
            </span>
          </div>

          {/* Months remaining */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-text-muted text-sm">Months to target</span>
            <span className="text-text font-medium">{monthsToTarget}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Debt Tracker component
 * Shows overall progress and individual debt cards
 */
export function DebtTracker({ debtStats, updateDebtBalance }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dismissedCelebration, setDismissedCelebration] = useState(false);
  
  const {
    currentTargetDebt,
    targetDebtPaidOff,
    targetPayoffPercentage,
    septemberPeak,
    targetDebts,
    managedDebts,
    termLoans,
    milestones,
    nextMilestone,
    recentlyReachedMilestone,
    avgMonthlyPayment,
    projectedPayoff,
    isOnTrack,
    monthsToTarget,
  } = debtStats;

  // Rotating win messages based on progress
  const winMessage = useMemo(() => {
    const messages = [];

    if (targetDebtPaidOff >= 20000) {
      messages.push("Twenty thousand dollars—crushed!");
    } else if (targetDebtPaidOff >= 15000) {
      messages.push("That's a used car worth of debt—gone!");
    } else if (targetDebtPaidOff >= 10000) {
      messages.push("Five figures eliminated!");
    } else if (targetDebtPaidOff >= 5000) {
      messages.push("$5K+ destroyed!");
    }

    if (targetPayoffPercentage >= 50) {
      messages.push("Past the halfway point!");
    } else if (targetPayoffPercentage >= 25) {
      messages.push("A quarter of the way to freedom!");
    }

    messages.push(
      `${formatCurrency(targetDebtPaidOff)} closer to freedom`,
      "Every payment counts 💪",
      "You're doing this!"
    );

    // Pick a message based on the day of month for consistency
    const dayIndex = new Date().getDate() % messages.length;
    return messages[dayIndex];
  }, [targetDebtPaidOff, targetPayoffPercentage]);

  // Compute whether to show celebration (derived state, no effects needed)
  const shouldShowCelebration = useMemo(() => {
    if (dismissedCelebration || !recentlyReachedMilestone) return false;
    const celebrated = localStorage.getItem('celebrated-milestones') || '';
    return !celebrated.includes(String(recentlyReachedMilestone.threshold));
  }, [recentlyReachedMilestone, dismissedCelebration]);

  // Handler for dismissing celebration
  const handleDismissCelebration = () => {
    if (recentlyReachedMilestone) {
      const celebrated = localStorage.getItem('celebrated-milestones') || '';
      localStorage.setItem(
        'celebrated-milestones',
        celebrated + ',' + recentlyReachedMilestone.threshold
      );
    }
    setDismissedCelebration(true);
  };

  // Combine all credit cards (targets + managed) and sort by remaining balance
  const allCreditCards = [...targetDebts, ...managedDebts].sort((a, b) => b.current - a.current);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg card-interactive relative">
      {/* Celebration overlay */}
      {shouldShowCelebration && recentlyReachedMilestone && (
        <MilestoneCelebration
          milestone={recentlyReachedMilestone}
          onDismiss={handleDismissCelebration}
        />
      )}

      {/* Header - "Money Crushed" emphasis */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text">CC Debt Payoff</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2 py-1 text-xs rounded transition-colors btn-interactive ${
                isEditing
                  ? 'bg-accent text-white'
                  : 'bg-gray-700 text-text-muted hover:bg-gray-600 hover:text-text'
              }`}
            >
              {isEditing ? '✓ Done' : '✎ Edit'}
            </button>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            {isEditing ? 'Click balances to update' : 'May 2026 Freedom Goal'}
          </p>
        </div>

        {/* Debt paid off - emphasize positive progress */}
        <div className="text-right">
          <div className="text-2xl font-bold text-success">
            {formatCurrency(targetDebtPaidOff)}
          </div>
          <div className="text-xs text-success font-medium">Debt Paid Off 🔥</div>
        </div>
      </div>

      {/* Win message - rotating encouragement */}
      {!isEditing && (
        <div className="text-sm text-text-muted text-center mb-3 italic">
          "{winMessage}"
        </div>
      )}

      {/* Countdown Timer */}
      {!isEditing && (
        <PayoffCountdown
          targetDate={debtStats.targetPayoffDate}
          className="mb-4"
        />
      )}

      {/* Payoff Projection */}
      {!isEditing && projectedPayoff && (
        <div className={`mb-4 p-3 rounded-lg ${isOnTrack ? 'bg-success/10' : 'bg-warning/10'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-text-muted">At current pace</div>
              <div className={`text-lg font-bold ${isOnTrack ? 'text-success' : 'text-warning'}`}>
                Debt-free by {projectedPayoff.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted">Avg monthly</div>
              <div className="text-text font-semibold">{formatCurrency(avgMonthlyPayment)}</div>
            </div>
          </div>
          {isOnTrack ? (
            <p className="text-xs text-success mt-2">
              You&apos;re on track to beat your May 2026 goal!
            </p>
          ) : (
            <p className="text-xs text-warning mt-2">
              Increase payments by {formatCurrency((currentTargetDebt / monthsToTarget) - avgMonthlyPayment)}/mo to hit May 2026
            </p>
          )}
        </div>
      )}

      {/* Overall progress bar with milestone markers */}
      <div className="mb-8">
        {/* Progress stats - secondary info */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text font-medium">
            {Math.round(targetPayoffPercentage)}% complete
          </span>
          <span className="text-text-muted">
            {formatCurrency(currentTargetDebt)} to go
          </span>
        </div>

        {/* Progress track showing paid portion with milestone markers */}
        <div className="relative h-4 bg-gray-700 rounded-full">
          {/* Paid portion - the actual progress bar fill */}
          <div
            className="absolute inset-y-0 left-0 bg-success rounded-full transition-all duration-500 ease-out z-10"
            style={{ width: `${Math.min(targetPayoffPercentage, 100)}%` }}
          >
            {/* Shimmer effect inside the bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
          </div>
          {/* Milestone markers - underneath the fill */}
          <div className="absolute inset-0 overflow-visible">
            <MilestoneMarkers milestones={milestones} />
          </div>
        </div>

        {/* Peak label */}
        <div className="text-xs text-text-muted mt-6 text-center">
          From {formatCurrency(septemberPeak)} peak → {formatCurrency(currentTargetDebt)} now
        </div>
      </div>

      {/* Next milestone indicator */}
      {!isEditing && nextMilestone && (
        <NextMilestoneCard
          nextMilestone={nextMilestone}
          currentPercentage={targetPayoffPercentage}
        />
      )}

      {/* All Credit Cards */}
      <div className="space-y-3 mt-4">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Credit Cards
        </h3>
        {allCreditCards.map((debt) => (
          <DebtCard
            key={debt.key}
            debt={debt}
            isEditing={isEditing}
            onBalanceChange={updateDebtBalance}
          />
        ))}
      </div>

      {/* Payoff Projection */}
      {!isEditing && <PayoffProjection debtStats={debtStats} />}

      {/* Term Loans (Personal Loan - fixed payments) */}
      {termLoans.length > 0 && (
        <div className="space-y-3 mt-5 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Term Loans
          </h3>
          <p className="text-xs text-text-muted -mt-1">
            Fixed payment schedule, not part of May 2026 goal
          </p>
          {termLoans.map((loan) => (
            <DebtCard
              key={loan.key}
              debt={loan}
              showTermInfo
              isEditing={isEditing}
              onBalanceChange={updateDebtBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DebtTracker;
