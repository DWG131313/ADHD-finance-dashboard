/**
 * Interest calculation utilities
 * 
 * Calculates potential interest savings from aggressive debt payoff
 * vs. minimum payment paths.
 * 
 * ADHD UX: Makes abstract "interest savings" into concrete dollar amounts
 */

/**
 * Calculate months and total interest for minimum payment path
 * 
 * Minimum payment formula (typical credit card):
 * - Greater of: $25 or 1% of balance + monthly interest
 * 
 * @param {number} balance - Current balance
 * @param {number} apr - Annual percentage rate (e.g., 22 for 22%)
 * @returns {{ months: number, totalInterest: number, totalPaid: number }}
 */
export function calculateMinimumPaymentPath(balance, apr) {
  if (balance <= 0 || apr <= 0) {
    return { months: 0, totalInterest: 0, totalPaid: balance };
  }

  const monthlyRate = apr / 100 / 12;
  let remaining = balance;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 360; // 30 year cap to prevent infinite loops

  while (remaining > 1 && months < maxMonths) {
    const monthlyInterest = remaining * monthlyRate;
    // Minimum payment: greater of $25 or 1% of balance + interest
    const minPayment = Math.max(25, remaining * 0.01 + monthlyInterest);
    const payment = Math.min(minPayment, remaining + monthlyInterest);

    totalInterest += monthlyInterest;
    remaining = remaining + monthlyInterest - payment;
    months++;
  }

  return {
    months,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(balance + totalInterest),
  };
}

/**
 * Calculate interest for aggressive payoff over N months
 * Uses amortization formula for accurate calculation
 * 
 * @param {number} balance - Current balance
 * @param {number} apr - Annual percentage rate
 * @param {number} targetMonths - Target months to payoff
 * @returns {{ months: number, totalInterest: number, monthlyPayment: number, totalPaid: number }}
 */
export function calculateAggressivePayoff(balance, apr, targetMonths) {
  if (balance <= 0 || targetMonths <= 0) {
    return { months: 0, totalInterest: 0, monthlyPayment: 0, totalPaid: 0 };
  }

  const monthlyRate = apr / 100 / 12;
  
  // Use amortization formula for monthly payment
  // P = (r * PV) / (1 - (1 + r)^-n)
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = balance / targetMonths;
  } else {
    monthlyPayment = (monthlyRate * balance) / (1 - Math.pow(1 + monthlyRate, -targetMonths));
  }

  // Calculate total interest
  const totalPaid = monthlyPayment * targetMonths;
  const totalInterest = totalPaid - balance;

  return {
    months: targetMonths,
    totalInterest: Math.round(Math.max(0, totalInterest)),
    monthlyPayment: Math.round(monthlyPayment),
    totalPaid: Math.round(totalPaid),
  };
}

/**
 * Calculate interest saved for a single debt
 * Compares minimum payment path vs aggressive payoff
 * 
 * @param {number} balance - Current balance
 * @param {number} apr - Annual percentage rate
 * @param {number} targetMonths - Target months to payoff
 * @returns {Object} Savings breakdown
 */
export function calculateInterestSaved(balance, apr, targetMonths) {
  const minPath = calculateMinimumPaymentPath(balance, apr);
  const aggressivePath = calculateAggressivePayoff(balance, apr, targetMonths);

  const interestSaved = minPath.totalInterest - aggressivePath.totalInterest;
  const monthsSaved = minPath.months - targetMonths;

  return {
    balance,
    apr,
    minimumPath: minPath,
    aggressivePath: aggressivePath,
    interestSaved: Math.max(0, interestSaved),
    monthsSaved: Math.max(0, monthsSaved),
    yearsSaved: Math.round(monthsSaved / 12 * 10) / 10,
  };
}

/**
 * Calculate total interest saved across all debts
 * 
 * @param {Object} debts - Debt objects from useDebt hook
 * @param {Date|string} targetDate - Target payoff date
 * @returns {Object} Total savings breakdown
 */
export function calculateTotalInterestSaved(debts, targetDate) {
  const today = new Date();
  const target = new Date(targetDate);
  const monthsToTarget = Math.max(1, Math.ceil(
    (target - today) / (1000 * 60 * 60 * 24 * 30.44) // Average days per month
  ));

  const results = [];
  let totalInterestSaved = 0;
  let totalMinimumInterest = 0;
  let totalAggressiveInterest = 0;
  let maxMonthsSaved = 0;

  for (const [key, debt] of Object.entries(debts)) {
    // Skip managed debts or zero balances
    if (debt.category === 'managed' || debt.current <= 0) continue;
    
    // Term loans have fixed interest, different handling
    if (debt.category === 'termLoan') {
      // Calculate remaining interest on term loan
      const remainingMonths = debt.termMonths 
        ? Math.max(0, debt.termMonths - Math.ceil((today - new Date(debt.startDate)) / (1000 * 60 * 60 * 24 * 30.44)))
        : 24; // Default 2 years if unknown
      
      const termInterest = calculateAggressivePayoff(debt.current, debt.apr, remainingMonths);
      
      results.push({
        key,
        name: debt.name,
        isTermLoan: true,
        balance: debt.current,
        apr: debt.apr,
        remainingMonths,
        totalInterest: termInterest.totalInterest,
        monthlyPayment: termInterest.monthlyPayment,
        message: `Fixed ${remainingMonths}-month term remaining`,
      });
      continue;
    }

    // Calculate savings for target debts (credit cards)
    const savings = calculateInterestSaved(debt.current, debt.apr, monthsToTarget);
    
    results.push({
      key,
      name: debt.name,
      isTermLoan: false,
      ...savings,
    });
    
    totalInterestSaved += savings.interestSaved;
    totalMinimumInterest += savings.minimumPath.totalInterest;
    totalAggressiveInterest += savings.aggressivePath.totalInterest;
    maxMonthsSaved = Math.max(maxMonthsSaved, savings.monthsSaved);
  }

  // Sort by interest saved (highest first)
  results.sort((a, b) => {
    if (a.isTermLoan && !b.isTermLoan) return 1;
    if (!a.isTermLoan && b.isTermLoan) return -1;
    return (b.interestSaved || 0) - (a.interestSaved || 0);
  });

  return {
    debts: results,
    totalInterestSaved,
    totalMinimumInterest,
    totalAggressiveInterest,
    totalMonthsSaved: maxMonthsSaved,
    totalYearsSaved: Math.round(maxMonthsSaved / 12 * 10) / 10,
    targetDate,
    monthsToTarget,
  };
}

/**
 * Get a motivational message based on interest saved
 * 
 * @param {number} amount - Amount saved
 * @returns {Object} Message and emoji
 */
export function getInterestSavedMessage(amount) {
  if (amount >= 15000) {
    return { 
      message: "That's a down payment on a car!", 
      emoji: "🚗",
      subtext: "Your future self is doing a happy dance"
    };
  }
  if (amount >= 10000) {
    return { 
      message: "That's a dream vacation!", 
      emoji: "🏖️",
      subtext: "All that money staying in YOUR pocket"
    };
  }
  if (amount >= 5000) {
    return { 
      message: "That's a solid emergency fund!", 
      emoji: "💪",
      subtext: "Financial security, here you come"
    };
  }
  if (amount >= 2500) {
    return { 
      message: "That's a nice chunk of change!", 
      emoji: "💰",
      subtext: "Every dollar saved is a dollar earned"
    };
  }
  if (amount >= 1000) {
    return { 
      message: "That's real money saved!", 
      emoji: "✨",
      subtext: "Keep up the momentum"
    };
  }
  if (amount >= 500) {
    return { 
      message: "Great start on savings!", 
      emoji: "🌱",
      subtext: "Small wins add up"
    };
  }
  return { 
    message: "Every dollar counts!", 
    emoji: "🚀",
    subtext: "You're making smart choices"
  };
}

export default {
  calculateMinimumPaymentPath,
  calculateAggressivePayoff,
  calculateInterestSaved,
  calculateTotalInterestSaved,
  getInterestSavedMessage,
};
