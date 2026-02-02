import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { calculateTotalInterestSaved, getInterestSavedMessage } from '../utils/interestCalculator';

/**
 * Interest Saved Calculator Component
 * 
 * ADHD UX: Makes abstract "interest savings" into concrete, motivating dollar amounts.
 * Shows users the tangible benefit of their aggressive debt payoff strategy.
 */
export function InterestSaved({ debts, targetDate, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);

  const savings = useMemo(() => {
    if (!debts || Object.keys(debts).length === 0) return null;
    return calculateTotalInterestSaved(debts, targetDate);
  }, [debts, targetDate]);

  const motivation = useMemo(() => {
    if (!savings) return null;
    return getInterestSavedMessage(savings.totalInterestSaved);
  }, [savings]);

  if (!savings || savings.totalInterestSaved <= 0) {
    return null;
  }

  // Compact version for sidebar/overview
  if (compact) {
    return (
      <div className="bg-background-card rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Interest Saved</h2>
          <span className="text-2xl">{motivation.emoji}</span>
        </div>
        
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-success mb-1">
            {formatCurrency(savings.totalInterestSaved)}
          </div>
          <div className="text-sm text-text-muted">
            saved vs. minimum payments
          </div>
        </div>

        {savings.totalYearsSaved > 0.5 && (
          <div className="text-center text-sm text-success mt-2">
            + {savings.totalYearsSaved} years of payments avoided
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
        >
          {showDetails ? 'Hide details ↑' : 'See breakdown ↓'}
        </button>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            {savings.debts.filter(d => !d.isTermLoan && d.interestSaved > 0).map((debt) => (
              <div key={debt.key} className="flex justify-between text-sm">
                <span className="text-text-muted">{debt.name}</span>
                <span className="text-success">+{formatCurrency(debt.interestSaved)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full version for Trends view
  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Interest Saved</h2>
          <p className="text-sm text-text-muted">
            By paying off by {new Date(targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className="text-3xl">{motivation.emoji}</span>
      </div>

      {/* Big number */}
      <div className="text-center py-6 mb-4 bg-success/10 rounded-xl border border-success/20">
        <div className="text-5xl font-bold text-success mb-2">
          {formatCurrency(savings.totalInterestSaved)}
        </div>
        <div className="text-text-muted">
          saved in interest vs. minimum payments
        </div>
        {savings.totalYearsSaved > 0.5 && (
          <div className="text-sm text-success mt-2 font-medium">
            That's {savings.totalYearsSaved} years of payments you're skipping!
          </div>
        )}
      </div>

      {/* Motivational message */}
      <div className="text-center mb-6 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-lg font-medium text-text">{motivation.message}</div>
        <div className="text-sm text-text-muted">{motivation.subtext}</div>
      </div>

      {/* Per-debt breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Breakdown by Account
        </h3>
        
        {savings.debts.map((debt) => (
          <div key={debt.key} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-text font-medium">{debt.name}</span>
                {debt.apr > 0 && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    debt.apr >= 20 ? 'bg-danger/20 text-danger' :
                    debt.apr >= 15 ? 'bg-warning/20 text-warning' :
                    'bg-gray-700 text-text-muted'
                  }`}>
                    {debt.apr}% APR
                  </span>
                )}
              </div>
              {!debt.isTermLoan && debt.interestSaved > 0 && (
                <span className="text-success font-bold text-lg">
                  +{formatCurrency(debt.interestSaved)}
                </span>
              )}
            </div>

            {debt.isTermLoan ? (
              <div className="text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">Term Loan</span>
                  <span>{debt.message}</span>
                </div>
                <div className="mt-2">
                  Fixed interest: {formatCurrency(debt.totalInterest)} over {debt.remainingMonths} months
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Minimum payment path */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger"></span>
                    <span className="text-text-muted">Minimum payments</span>
                  </div>
                  <div className="text-right text-text-muted">
                    <span className="font-medium">{debt.minimumPath.months} months</span>
                    <span className="mx-1">·</span>
                    <span className="text-danger">{formatCurrency(debt.minimumPath.totalInterest)} interest</span>
                  </div>
                </div>

                {/* Your aggressive path */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    <span className="text-text-muted">Your plan</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-text">{debt.aggressivePath.months} months</span>
                    <span className="mx-1 text-text-muted">·</span>
                    <span className="text-success">{formatCurrency(debt.aggressivePath.totalInterest)} interest</span>
                  </div>
                </div>

                {/* Time saved */}
                {debt.monthsSaved > 0 && (
                  <div className="text-xs text-success mt-1 pt-2 border-t border-gray-700">
                    ⏱️ {debt.yearsSaved > 1 ? `${debt.yearsSaved} years` : `${debt.monthsSaved} months`} of payments avoided
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-5 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-danger">
              {formatCurrency(savings.totalMinimumInterest)}
            </div>
            <div className="text-xs text-text-muted">
              Interest with minimums
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(savings.totalAggressiveInterest)}
            </div>
            <div className="text-xs text-text-muted">
              Interest with your plan
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">
              {savings.totalYearsSaved > 0 ? `${savings.totalYearsSaved}yr` : `${savings.totalMonthsSaved}mo`}
            </div>
            <div className="text-xs text-text-muted">
              Time saved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterestSaved;
