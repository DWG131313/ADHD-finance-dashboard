import { useMemo } from 'react';
import { differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns';

/**
 * Visual countdown timer to target payoff date
 * ADHD UX: Makes abstract deadline feel concrete and urgent
 */
export function PayoffCountdown({ targetDate, className = '' }) {
  const countdown = useMemo(() => {
    const now = new Date();
    const target = new Date(targetDate);

    const totalDays = differenceInDays(target, now);
    const months = differenceInMonths(target, now);
    const weeks = differenceInWeeks(target, now);
    const remainingDays = totalDays - (months * 30); // Approximate

    // Determine urgency level and message
    let urgencyLevel, message;
    if (totalDays <= 0) {
      urgencyLevel = 'complete';
      message = "Target date reached!";
    } else if (months < 1) {
      urgencyLevel = 'critical';
      message = "Final countdown! 🏁";
    } else if (months < 3) {
      urgencyLevel = 'urgent';
      message = "Final push! You've got this 💪";
    } else if (months < 6) {
      urgencyLevel = 'approaching';
      message = "Home stretch approaching";
    } else {
      urgencyLevel = 'steady';
      message = "Plenty of time—stay steady";
    }

    return {
      totalDays,
      months,
      weeks,
      remainingDays: Math.max(0, remainingDays),
      urgencyLevel,
      message,
    };
  }, [targetDate]);

  // Color classes based on urgency
  const urgencyColors = {
    complete: 'text-success',
    critical: 'text-danger',
    urgent: 'text-warning',
    approaching: 'text-accent',
    steady: 'text-text-muted',
  };

  const bgColors = {
    complete: 'bg-success/10 border-success/30',
    critical: 'bg-danger/10 border-danger/30',
    urgent: 'bg-warning/10 border-warning/30',
    approaching: 'bg-accent/10 border-accent/30',
    steady: 'bg-gray-800/50 border-gray-700',
  };

  if (countdown.totalDays <= 0) {
    return (
      <div className={`rounded-lg p-3 border ${bgColors.complete} ${className}`}>
        <div className="text-center">
          <span className="text-success font-bold text-lg">🎉 Target Reached!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-3 border ${bgColors[countdown.urgencyLevel]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {countdown.months > 0 ? (
            <>
              <span className={`text-2xl font-bold ${urgencyColors[countdown.urgencyLevel]}`}>
                {countdown.months}
              </span>
              <span className="text-text-muted text-sm">
                {countdown.months === 1 ? 'month' : 'months'}
              </span>
              {countdown.remainingDays > 0 && (
                <>
                  <span className={`text-xl font-bold ${urgencyColors[countdown.urgencyLevel]}`}>
                    · {countdown.remainingDays}
                  </span>
                  <span className="text-text-muted text-sm">days</span>
                </>
              )}
            </>
          ) : (
            <>
              <span className={`text-2xl font-bold ${urgencyColors[countdown.urgencyLevel]}`}>
                {countdown.totalDays}
              </span>
              <span className="text-text-muted text-sm">
                {countdown.totalDays === 1 ? 'day' : 'days'}
              </span>
            </>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">to freedom</div>
        </div>
      </div>
      <div className={`text-xs mt-1 ${urgencyColors[countdown.urgencyLevel]}`}>
        {countdown.message}
      </div>
    </div>
  );
}

export default PayoffCountdown;
