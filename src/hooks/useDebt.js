import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEBT_KEY = 'finance-debt';
const DEBT_HISTORY_KEY = 'finance-debt-history';

/**
 * Default debt configuration
 * 
 * Categories:
 * - targetDebt: Credit cards being aggressively paid off (May 2026 goal)
 * - managedDebt: Under control, just maintaining (Apple Card)
 * - termLoan: Fixed-term loans with regular payments (Personal Loan)
 */
const DEFAULT_DEBTS = {
  appleCard: {
    name: 'Apple Card',
    original: 750,
    current: 0, // Paid off!
    apr: 0,
    note: 'Paid off - now just subscriptions & installments',
    category: 'managed', // Under control, not part of payoff goal
    color: '#22c55e', // Green - paid off
  },
  bofaAtmos: {
    name: 'BofA Atmos',
    original: 3657,
    current: 2905,
    apr: 20,
    note: 'High APR - pay off fast',
    category: 'target', // Part of May 2026 goal
    color: '#ef476f', // Red - high APR
  },
  amexDelta: {
    name: 'Amex Delta',
    original: 36420,
    current: 9554.73,
    apr: 22,
    note: 'Primary payoff target',
    category: 'target', // Part of May 2026 goal
    color: '#4361ee', // Accent blue
  },
  personalLoan: {
    name: 'Personal Loan',
    original: 21000,
    current: 14225, // Update with actual balance
    apr: 10,
    note: 'Lending Club - 3yr term (Spring 2025)',
    category: 'termLoan', // Fixed payments, not part of May 2026 goal
    termMonths: 36,
    startDate: '2025-04-01',
    color: '#a3a3a3', // Gray - separate from CC payoff
  },
};

// September 2025 peak for target CC debt only (BofA + Amex)
const SEPT_2025_CC_PEAK = 40077; // 3657 + 36420

// Target payoff date
const TARGET_PAYOFF_DATE = new Date('2026-05-31');

// Milestone thresholds (percentage of debt paid off)
const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

/**
 * Calculate months between two dates
 */
function monthsBetween(startDate, endDate) {
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}

/**
 * Calculate projected payoff date based on payment rate
 * @param {number} currentBalance - Current total debt
 * @param {number} monthlyPayment - Average monthly payment
 * @returns {Date|null} Projected payoff date or null if can't calculate
 */
function calculatePayoffDate(currentBalance, monthlyPayment) {
  if (monthlyPayment <= 0 || currentBalance <= 0) return null;

  const monthsToPayoff = Math.ceil(currentBalance / monthlyPayment);
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

  return payoffDate;
}

/**
 * Custom hook for debt tracking and calculations
 */
export function useDebt() {
  const [debts, setDebts] = useLocalStorage(DEBT_KEY, DEFAULT_DEBTS);
  const [debtHistory, setDebtHistory] = useLocalStorage(DEBT_HISTORY_KEY, []);

  /**
   * Record a snapshot of current debt balances
   * Called automatically when balances change
   */
  const recordSnapshot = useCallback((currentDebts) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calculate target debt total
    const targetTotal = Object.entries(currentDebts)
      .filter(([, debt]) => debt.category === 'target')
      .reduce((sum, [, debt]) => sum + debt.current, 0);
    
    const snapshot = {
      date: today,
      timestamp: now.toISOString(),
      totalTargetDebt: targetTotal,
      balances: Object.fromEntries(
        Object.entries(currentDebts).map(([key, debt]) => [key, debt.current])
      ),
    };
    
    setDebtHistory((prev) => {
      // Check if we already have a snapshot for today
      const existingIndex = prev.findIndex((s) => s.date === today);
      if (existingIndex >= 0) {
        // Update today's snapshot
        const updated = [...prev];
        updated[existingIndex] = snapshot;
        return updated;
      }
      // Add new snapshot
      return [...prev, snapshot].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, [setDebtHistory]);

  // Calculate totals and progress
  const debtStats = useMemo(() => {
    const debtEntries = Object.entries(debts);

    // Target debts only (BofA + Amex - the May 2026 goal)
    const targetDebts = debtEntries.filter(
      ([, debt]) => debt.category === 'target'
    );

    // Managed debts (Apple Card - under control)
    const managedDebts = debtEntries.filter(
      ([, debt]) => debt.category === 'managed'
    );

    // Term loans (Personal Loan - fixed payments)
    const termLoans = debtEntries.filter(
      ([, debt]) => debt.category === 'termLoan'
    );

    // Target CC debt (the focus for May 2026)
    const currentTargetDebt = targetDebts.reduce((sum, [, debt]) => sum + debt.current, 0);
    const targetDebtPaidOff = SEPT_2025_CC_PEAK - currentTargetDebt;
    const targetPayoffPercentage = (targetDebtPaidOff / SEPT_2025_CC_PEAK) * 100;

    // Total all debt (for context, not the main focus)
    const totalOriginal = debtEntries.reduce((sum, [, debt]) => sum + debt.original, 0);
    const totalCurrent = debtEntries.reduce((sum, [, debt]) => sum + debt.current, 0);
    const totalPaidOff = totalOriginal - totalCurrent;
    const totalPayoffPercentage = (totalPaidOff / totalOriginal) * 100;

    // Estimate monthly payment based on progress since September
    // September 2025 to now
    const startDate = new Date('2025-09-01');
    const monthsElapsed = monthsBetween(startDate, new Date()) || 1;
    const avgMonthlyPayment = targetDebtPaidOff / monthsElapsed;

    // Calculate projected payoff for target debts only
    const projectedPayoff = calculatePayoffDate(currentTargetDebt, avgMonthlyPayment);

    // Check if on track for May 2026
    const isOnTrack = projectedPayoff && projectedPayoff <= TARGET_PAYOFF_DATE;

    // Months remaining to target
    const monthsToTarget = monthsBetween(new Date(), TARGET_PAYOFF_DATE);
    const requiredMonthlyPayment =
      monthsToTarget > 0 ? currentTargetDebt / monthsToTarget : currentTargetDebt;

    // Calculate term loan progress
    const termLoanStats = termLoans.map(([key, loan]) => {
      const paidOff = loan.original - loan.current;
      const percentagePaid = (paidOff / loan.original) * 100;
      
      // Calculate months remaining if we have term info
      let monthsRemaining = null;
      if (loan.termMonths && loan.startDate) {
        const startDate = new Date(loan.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + loan.termMonths);
        monthsRemaining = monthsBetween(new Date(), endDate);
      }
      
      return {
        key,
        ...loan,
        paidOff,
        percentagePaid,
        monthsRemaining,
        monthlyPayment: loan.termMonths ? loan.original / loan.termMonths : null,
      };
    });

    // Calculate milestones
    const milestones = MILESTONE_THRESHOLDS.map((threshold) => {
      const reached = targetPayoffPercentage >= threshold;
      const amountNeeded = (threshold / 100) * SEPT_2025_CC_PEAK;
      const amountRemaining = Math.max(0, amountNeeded - targetDebtPaidOff);
      return {
        threshold,
        label: threshold === 100 ? 'Debt Free!' : `${threshold}% Paid Off`,
        reached,
        amountNeeded: Math.round(amountNeeded),
        amountRemaining: Math.round(amountRemaining),
      };
    });

    // Find the next milestone to reach
    const nextMilestone = milestones.find((m) => !m.reached) || null;
    
    // Find recently reached milestone (within 0.5% of crossing)
    const recentlyReachedMilestone = milestones.find((m) => 
      m.reached && targetPayoffPercentage < m.threshold + 0.5
    ) || null;

    // Check for individual cards that hit $0
    const paidOffCards = targetDebts
      .filter(([, debt]) => debt.current === 0)
      .map(([key, debt]) => ({ key, name: debt.name }));

    return {
      // Target CC debt stats (May 2026 goal - BofA + Amex)
      currentTargetDebt,
      targetDebtPaidOff,
      targetPayoffPercentage,
      septemberPeak: SEPT_2025_CC_PEAK,

      // Total debt stats (all debts for context)
      totalOriginal,
      totalCurrent,
      totalPaidOff,
      totalPayoffPercentage,

      // Projections for target debt
      avgMonthlyPayment,
      projectedPayoff,
      targetPayoffDate: TARGET_PAYOFF_DATE,
      isOnTrack,
      monthsToTarget,
      requiredMonthlyPayment,

      // Milestones
      milestones,
      nextMilestone,
      recentlyReachedMilestone,
      paidOffCards,

      // Categorized debt progress
      targetDebts: targetDebts.map(([key, debt]) => ({
        key,
        ...debt,
        paidOff: debt.original - debt.current,
        percentagePaid: ((debt.original - debt.current) / debt.original) * 100,
      })),
      managedDebts: managedDebts.map(([key, debt]) => ({
        key,
        ...debt,
        paidOff: debt.original - debt.current,
        percentagePaid: ((debt.original - debt.current) / debt.original) * 100,
      })),
      termLoans: termLoanStats,

      // All debts for backwards compatibility
      debtProgress: debtEntries.map(([key, debt]) => ({
        key,
        ...debt,
        paidOff: debt.original - debt.current,
        percentagePaid: ((debt.original - debt.current) / debt.original) * 100,
      })),
    };
  }, [debts]);

  // Update a specific debt balance
  const updateDebtBalance = (debtKey, newBalance) => {
    setDebts((prev) => {
      const updated = {
        ...prev,
        [debtKey]: {
          ...prev[debtKey],
          current: newBalance,
        },
      };
      // Record snapshot when balance changes
      recordSnapshot(updated);
      return updated;
    });
  };

  // Update any debt field (APR, monthly payment, etc.)
  const updateDebtDetails = (debtKey, updates) => {
    setDebts((prev) => ({
      ...prev,
      [debtKey]: {
        ...prev[debtKey],
        ...updates,
      },
    }));
  };

  // Update multiple debt balances at once
  const updateAllBalances = (newBalances) => {
    setDebts((prev) => {
      const updated = { ...prev };
      Object.entries(newBalances).forEach(([key, balance]) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], current: balance };
        }
      });
      // Record snapshot when balances change
      recordSnapshot(updated);
      return updated;
    });
  };

  // Reset to defaults
  const resetDebts = () => {
    setDebts(DEFAULT_DEBTS);
    setDebtHistory([]);
  };

  return {
    debts,
    debtStats,
    debtHistory,
    updateDebtBalance,
    updateDebtDetails,
    updateAllBalances,
    resetDebts,
  };
}

export default useDebt;
