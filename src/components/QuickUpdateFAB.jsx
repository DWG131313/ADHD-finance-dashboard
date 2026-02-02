import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';

/**
 * Quick Update Floating Action Button and Modal
 * ADHD UX: Reduces friction for the most common action
 */
export function QuickUpdateFAB({ debts, updateDebtBalance, onUpdateComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [balances, setBalances] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Open modal with fresh balances
  const openModal = useCallback(() => {
    if (debts) {
      const initial = {};
      Object.entries(debts).forEach(([key, debt]) => {
        initial[key] = debt.current.toString();
      });
      setBalances(initial);
      setHasChanges(false);
    }
    setIsOpen(true);
  }, [debts]);

  // Keyboard shortcut: U to open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        openModal();
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openModal]);

  const handleBalanceChange = (key, value) => {
    setBalances((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Update each changed balance
    Object.entries(balances).forEach(([key, value]) => {
      const newValue = parseFloat(value);
      const oldValue = debts[key]?.current;

      if (!isNaN(newValue) && newValue !== oldValue) {
        updateDebtBalance(key, newValue);
      }
    });

    onUpdateComplete?.();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Calculate total change
  const totalChange = Object.entries(balances).reduce((sum, [key, value]) => {
    const newValue = parseFloat(value) || 0;
    const oldValue = debts[key]?.current || 0;
    return sum + (oldValue - newValue);
  }, 0);

  if (!debts) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:bg-accent/80 transition-all btn-interactive flex items-center justify-center z-50 group"
        aria-label="Quick update balances (U)"
        title="Quick Update (U)"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-xs text-text rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Press U to update
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-background-card rounded-xl shadow-2xl w-full max-w-md animate-celebrate"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">Update Balances</h2>
                <button
                  onClick={handleCancel}
                  className="p-1 text-text-muted hover:text-text transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-text-muted mt-1">
                Enter current balances from your accounts
              </p>
            </div>

            {/* Balance inputs */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(debts)
                .filter(([, debt]) => debt.category !== 'managed' || debt.current > 0)
                .map(([key, debt]) => {
                  const currentValue = parseFloat(balances[key]) || 0;
                  const originalValue = debt.current;
                  const change = originalValue - currentValue;

                  return (
                    <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-text font-medium">{debt.name}</span>
                        {change !== 0 && (
                          <span
                            className={`text-sm font-medium ${
                              change > 0 ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {change > 0 ? '−' : '+'}{formatCurrency(Math.abs(change))}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted">$</span>
                        <input
                          type="number"
                          value={balances[key] || ''}
                          onChange={(e) => handleBalanceChange(key, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-text text-right font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        Was: {formatCurrency(originalValue)}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Summary and actions */}
            <div className="p-5 border-t border-gray-700">
              {/* Total change */}
              {hasChanges && totalChange !== 0 && (
                <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Total paid off</span>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(totalChange)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 bg-gray-700 text-text rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    hasChanges
                      ? 'bg-accent text-white hover:bg-accent/80'
                      : 'bg-gray-700 text-text-muted cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-text-muted mt-3">
                Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-text">Escape</kbd> to cancel
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickUpdateFAB;
