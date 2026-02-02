import { useState, useMemo } from 'react';
import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Single category row component
 */
function CategoryRow({ category, spent, budget, paceStatus }) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  // Determine status indicator - compassionate messaging
  let statusIndicator = null;
  if (percentage > 100) {
    statusIndicator = (
      <span className="text-danger text-sm font-medium">Maxed out</span>
    );
  } else if (percentage > 80) {
    statusIndicator = (
      <span className="text-warning text-sm">{Math.round(100 - percentage)}% buffer</span>
    );
  } else if (percentage < 50) {
    statusIndicator = (
      <span className="text-success text-sm">🔥 On track</span>
    );
  }

  return (
    <div className="group">
      {/* Category header row */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-text font-medium">{category}</span>
        <div className="flex items-center gap-3">
          {statusIndicator}
          <span className="text-text">
            {formatCurrency(spent)}
            <span className="text-text-muted"> / {formatCurrency(budget)}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={spent} max={budget} showPercentage={false} size="sm" />

      {/* Pacing info - compassionate messaging */}
      {paceStatus && paceStatus.status !== 'under' && (
        <div className="mt-1 text-xs text-text-muted">
          {paceStatus.status === 'over' ? (
            <span>
              Spending a bit fast at{' '}
              <span className="text-warning">{paceStatus.percentage}%</span>
              {' '}(expected {paceStatus.expectedPercentage}%)
            </span>
          ) : (
            <span>
              Right on pace at <span className="text-text">{paceStatus.percentage}%</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Collapsible category group
 */
function CategoryGroup({ title, categories, defaultOpen, statusColor, icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (categories.length === 0) return null;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Group header - clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className={`font-medium ${statusColor}`}>{title}</span>
          <span className="text-text-muted text-sm">({categories.length})</span>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Group content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {categories.map(({ category, spent, budget, paceStatus }) => (
            <CategoryRow
              key={category}
              category={category}
              spent={spent}
              budget={budget}
              paceStatus={paceStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Displays all tracked categories with progress bars
 * ADHD UX: Categories chunked into "Needs Attention" and "On Track" groups
 */
export function CategoryBudgets({
  categorySpending,
  categoryBudgets,
  categoryPaceStatus,
  monthLabel,
}) {
  // Group categories by status
  const { needsAttention, onTrack, summary } = useMemo(() => {
    const needsAttention = [];
    const onTrack = [];

    Object.keys(categoryBudgets).forEach((category) => {
      const spent = categorySpending[category] || 0;
      const budget = categoryBudgets[category];
      const paceStatus = categoryPaceStatus[category];
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      const item = { category, spent, budget, paceStatus, percentage };

      // Categories over 70% or over-pace need attention
      if (percentage > 70 || (paceStatus && paceStatus.status === 'over')) {
        needsAttention.push(item);
      } else {
        onTrack.push(item);
      }
    });

    // Sort each group by percentage (highest first for attention, lowest first for on track)
    needsAttention.sort((a, b) => b.percentage - a.percentage);
    onTrack.sort((a, b) => a.percentage - b.percentage);

    const totalCategories = needsAttention.length + onTrack.length;
    const summary = {
      onTrackCount: onTrack.length,
      totalCount: totalCategories,
      allOnTrack: needsAttention.length === 0,
    };

    return { needsAttention, onTrack, summary };
  }, [categorySpending, categoryBudgets, categoryPaceStatus]);

  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);
  const totalBudget = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg card-interactive">
      {/* Header with summary */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Category Budgets</h2>
          <p className="text-sm text-text-muted mt-0.5">{monthLabel}</p>
        </div>
        {/* Summary badge */}
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            summary.allOnTrack
              ? 'bg-success/20 text-success'
              : 'bg-warning/20 text-warning'
          }`}
        >
          {summary.allOnTrack ? (
            <>🔥 All on track!</>
          ) : (
            <>{summary.onTrackCount} of {summary.totalCount} on track</>
          )}
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-3">
        {/* Needs Attention - always expanded by default */}
        <CategoryGroup
          title="Needs Attention"
          categories={needsAttention}
          defaultOpen={true}
          statusColor="text-warning"
          icon="⚠️"
        />

        {/* On Track - collapsed by default when there are attention items */}
        <CategoryGroup
          title="On Track"
          categories={onTrack}
          defaultOpen={needsAttention.length === 0}
          statusColor="text-success"
          icon="✓"
        />
      </div>

      {/* Total summary */}
      <div className="mt-5 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Total Flexible Spending</span>
          <span className="text-text font-semibold">
            {formatCurrency(totalSpent)}
            <span className="text-text-muted font-normal"> / {formatCurrency(totalBudget)}</span>
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar value={totalSpent} max={totalBudget} showPercentage={true} size="sm" />
        </div>
      </div>
    </div>
  );
}

export default CategoryBudgets;
