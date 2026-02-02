import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MILESTONES_KEY = 'finance-milestones';

/**
 * Extended milestone definitions
 * Mix of percentage-based and dollar-amount milestones for more frequent wins
 */
const MILESTONE_DEFINITIONS = [
  // Percentage milestones
  { id: 'first-update', type: 'special', label: 'First Strike', description: 'Started tracking debt', emoji: '⚡' },
  { id: '10-percent', type: 'percentage', threshold: 10, label: 'Getting Started', description: '10% eliminated', emoji: '🌱' },
  { id: '25-percent', type: 'percentage', threshold: 25, label: 'Quarter Crushed', description: '25% down!', emoji: '💪' },
  { id: '33-percent', type: 'percentage', threshold: 33, label: 'One-Third Free', description: 'A third of the way', emoji: '🎯' },
  { id: '50-percent', type: 'percentage', threshold: 50, label: 'Halfway Hero', description: 'The halfway point!', emoji: '🔥' },
  { id: '66-percent', type: 'percentage', threshold: 66, label: 'Two-Thirds Done', description: 'Only a third left', emoji: '🚀' },
  { id: '75-percent', type: 'percentage', threshold: 75, label: 'Final Quarter', description: 'Just 25% remaining', emoji: '⭐' },
  { id: '90-percent', type: 'percentage', threshold: 90, label: 'Almost There', description: 'Single digits!', emoji: '🏃' },
  { id: '100-percent', type: 'percentage', threshold: 100, label: 'DEBT FREE', description: 'You did it!', emoji: '🎉' },

  // Dollar amount milestones
  { id: '1k-paid', type: 'amount', threshold: 1000, label: 'First Thousand', description: '$1,000 crushed', emoji: '💵' },
  { id: '5k-paid', type: 'amount', threshold: 5000, label: 'Five Grand Slammed', description: '$5,000 destroyed', emoji: '💰' },
  { id: '10k-paid', type: 'amount', threshold: 10000, label: 'Ten K Takedown', description: 'Five figures gone!', emoji: '🏆' },
  { id: '15k-paid', type: 'amount', threshold: 15000, label: 'Fifteen K Fighter', description: '$15,000 eliminated', emoji: '⚔️' },
  { id: '20k-paid', type: 'amount', threshold: 20000, label: 'Twenty K Titan', description: '$20,000 vanquished', emoji: '👑' },
  { id: '25k-paid', type: 'amount', threshold: 25000, label: 'Quarter Hundred K', description: '$25,000 annihilated', emoji: '💎' },
  { id: '30k-paid', type: 'amount', threshold: 30000, label: 'Thirty K Slayer', description: '$30,000 demolished', emoji: '🗡️' },
];

/**
 * Custom hook for milestone tracking and celebrations
 * ADHD UX: Frequent wins and dopamine hits
 */
export function useMilestones(debtPaidOff, payoffPercentage, peakDebt) {
  const [state, setState] = useLocalStorage(MILESTONES_KEY, {
    celebrated: [],
    firstUpdateDone: false,
    lastCheck: null,
  });

  /**
   * Calculate which milestones are reached based on current progress
   */
  const milestoneStatus = useMemo(() => {
    const reached = [];
    const upcoming = [];

    for (const milestone of MILESTONE_DEFINITIONS) {
      let isReached = false;
      let progress = 0;
      let amountToGo = 0;

      if (milestone.type === 'percentage') {
        isReached = payoffPercentage >= milestone.threshold;
        progress = Math.min((payoffPercentage / milestone.threshold) * 100, 100);
        amountToGo = Math.max(0, (milestone.threshold / 100) * peakDebt - debtPaidOff);
      } else if (milestone.type === 'amount') {
        isReached = debtPaidOff >= milestone.threshold;
        progress = Math.min((debtPaidOff / milestone.threshold) * 100, 100);
        amountToGo = Math.max(0, milestone.threshold - debtPaidOff);
      } else if (milestone.type === 'special' && milestone.id === 'first-update') {
        isReached = state.firstUpdateDone;
        progress = isReached ? 100 : 0;
      }

      const milestoneWithStatus = {
        ...milestone,
        reached: isReached,
        celebrated: state.celebrated.includes(milestone.id),
        progress,
        amountToGo: Math.round(amountToGo),
      };

      if (isReached) {
        reached.push(milestoneWithStatus);
      } else {
        upcoming.push(milestoneWithStatus);
      }
    }

    // Sort upcoming by how close they are
    upcoming.sort((a, b) => b.progress - a.progress);

    return { reached, upcoming };
  }, [debtPaidOff, payoffPercentage, peakDebt, state]);

  /**
   * Find newly reached milestones that haven't been celebrated
   */
  const newlyReached = useMemo(() => {
    return milestoneStatus.reached.filter((m) => !m.celebrated);
  }, [milestoneStatus]);

  /**
   * Get the next milestone to reach
   */
  const nextMilestone = useMemo(() => {
    return milestoneStatus.upcoming[0] || null;
  }, [milestoneStatus]);

  /**
   * Mark a milestone as celebrated
   */
  const celebrateMilestone = useCallback((milestoneId) => {
    setState((prev) => ({
      ...prev,
      celebrated: [...new Set([...prev.celebrated, milestoneId])],
      lastCheck: new Date().toISOString(),
    }));
  }, [setState]);

  /**
   * Mark first update as done (triggers first-update milestone)
   */
  const markFirstUpdate = useCallback(() => {
    if (!state.firstUpdateDone) {
      setState((prev) => ({
        ...prev,
        firstUpdateDone: true,
      }));
    }
  }, [state.firstUpdateDone, setState]);

  /**
   * Reset all milestone celebrations (for testing)
   */
  const resetCelebrations = useCallback(() => {
    setState({
      celebrated: [],
      firstUpdateDone: false,
      lastCheck: null,
    });
  }, [setState]);

  /**
   * Get display milestones for progress bar (subset)
   */
  const progressBarMilestones = useMemo(() => {
    return MILESTONE_DEFINITIONS
      .filter((m) => m.type === 'percentage' && [25, 50, 75, 100].includes(m.threshold))
      .map((m) => ({
        ...m,
        reached: payoffPercentage >= m.threshold,
      }));
  }, [payoffPercentage]);

  return {
    // All milestones with status
    reached: milestoneStatus.reached,
    upcoming: milestoneStatus.upcoming,

    // For celebrations
    newlyReached,
    celebrateMilestone,

    // Next target
    nextMilestone,

    // For progress bar display
    progressBarMilestones,

    // Special actions
    markFirstUpdate,
    resetCelebrations,

    // Stats
    totalReached: milestoneStatus.reached.length,
    totalMilestones: MILESTONE_DEFINITIONS.length,
  };
}

export default useMilestones;
