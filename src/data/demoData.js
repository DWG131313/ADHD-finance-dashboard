// Demo data for showcasing the dashboard
// Uses fictional person "Alex Demo" with different financial profile

/**
 * Generate demo transactions for the past 6 months
 * Shows a realistic spending pattern with some months over/under budget
 */
function generateDemoTransactions() {
  const transactions = [];
  const today = new Date();

  // Merchant pools by category
  const merchants = {
    Groceries: ['Whole Foods', 'Trader Joes', 'Safeway', 'Costco', 'Target'],
    Dining: ['Chipotle', 'Olive Garden', 'Local Bistro', 'Thai Express', 'Sushi Place'],
    Discretionary: ['Amazon', 'Best Buy', 'Target', 'Etsy', 'REI'],
    Dates: ['Cinema', 'Escape Room', 'Mini Golf', 'Concert Tickets', 'Museum'],
    Travel: ['Airbnb', 'Southwest Airlines', 'Uber', 'Hotel Tonight', 'VRBO'],
    Coffee: ['Starbucks', 'Local Coffee', 'Dunkin', 'Peets Coffee'],
    Subscriptions: ['Netflix', 'Spotify', 'Adobe', 'iCloud', 'YouTube Premium'],
    Utilities: ['Electric Co', 'Water Dept', 'Internet Provider', 'Gas Company'],
    Rent: ['Property Management LLC'],
    'Loan Payment': ['Auto Loan Bank'],
  };

  // Monthly spending patterns (multiplier for base amounts)
  // Varies to create realistic over/under budget months
  const monthlyPatterns = [
    { groceries: 1.0, dining: 0.8, discretionary: 0.7, dates: 0.9, travel: 0.5 }, // 5 months ago - under
    { groceries: 1.1, dining: 1.2, discretionary: 1.3, dates: 1.1, travel: 2.0 }, // 4 months ago - over (holiday)
    { groceries: 0.9, dining: 0.7, discretionary: 0.6, dates: 0.8, travel: 0.3 }, // 3 months ago - way under
    { groceries: 1.0, dining: 1.0, discretionary: 1.0, dates: 1.0, travel: 1.0 }, // 2 months ago - on pace
    { groceries: 1.05, dining: 1.1, discretionary: 0.9, dates: 1.2, travel: 0.8 }, // 1 month ago - slightly over
    { groceries: 0.4, dining: 0.3, discretionary: 0.2, dates: 0.3, travel: 0.0 }, // current month - partial
  ];

  // Generate 6 months of data
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const pattern = monthlyPatterns[5 - monthOffset];

    // How many days to generate (full month for past, partial for current)
    const daysToGenerate = monthOffset === 0 ? today.getDate() : daysInMonth;

    // Groceries - ~$600 base, 4-6 trips per month
    const groceryTrips = Math.floor(4 + Math.random() * 3);
    for (let i = 0; i < groceryTrips; i++) {
      const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
      const amount = (80 + Math.random() * 70) * pattern.groceries;
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        name: merchants.Groceries[Math.floor(Math.random() * merchants.Groceries.length)],
        amount: Math.round(amount * 100) / 100,
        category: 'Groceries',
        type: 'regular',
        excluded: false,
      });
    }

    // Dining - ~$400 base, 6-10 meals out
    const diningTrips = Math.floor(6 + Math.random() * 5);
    for (let i = 0; i < diningTrips; i++) {
      const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
      const amount = (25 + Math.random() * 40) * pattern.dining;
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        name: merchants.Dining[Math.floor(Math.random() * merchants.Dining.length)],
        amount: Math.round(amount * 100) / 100,
        category: 'Restaurants',
        type: 'regular',
        excluded: false,
      });
    }

    // Discretionary - ~$450 base, 3-6 purchases
    const discretionaryPurchases = Math.floor(3 + Math.random() * 4);
    for (let i = 0; i < discretionaryPurchases; i++) {
      const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
      const amount = (50 + Math.random() * 100) * pattern.discretionary;
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        name: merchants.Discretionary[Math.floor(Math.random() * merchants.Discretionary.length)],
        amount: Math.round(amount * 100) / 100,
        category: 'Shops',
        type: 'regular',
        excluded: false,
      });
    }

    // Dates - ~$400 base, 2-4 date nights
    const dateNights = Math.floor(2 + Math.random() * 3);
    for (let i = 0; i < dateNights; i++) {
      const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
      const amount = (80 + Math.random() * 60) * pattern.dates;
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        name: merchants.Dates[Math.floor(Math.random() * merchants.Dates.length)],
        amount: Math.round(amount * 100) / 100,
        category: 'Entertainment',
        type: 'regular',
        excluded: false,
      });
    }

    // Travel - ~$300 base, 0-2 travel expenses
    if (pattern.travel > 0) {
      const travelExpenses = Math.floor(Math.random() * 3);
      for (let i = 0; i < travelExpenses; i++) {
        const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
        const amount = (100 + Math.random() * 200) * pattern.travel;
        transactions.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          name: merchants.Travel[Math.floor(Math.random() * merchants.Travel.length)],
          amount: Math.round(amount * 100) / 100,
          category: 'Travel & Vacation',
          type: 'regular',
          excluded: false,
        });
      }
    }

    // Coffee - 8-15 coffees per month
    const coffeeRuns = Math.floor(8 + Math.random() * 8);
    for (let i = 0; i < coffeeRuns; i++) {
      const day = Math.min(Math.floor(Math.random() * daysToGenerate) + 1, daysToGenerate);
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        name: merchants.Coffee[Math.floor(Math.random() * merchants.Coffee.length)],
        amount: Math.round((4 + Math.random() * 4) * 100) / 100,
        category: 'Coffee',
        type: 'regular',
        excluded: false,
      });
    }

    // Fixed monthly expenses (only on specific days)
    // Rent - 1st of month
    if (daysToGenerate >= 1) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        name: 'Property Management LLC',
        amount: 2200,
        category: 'Rent',
        type: 'regular',
        excluded: false,
      });
    }

    // Subscriptions - various days
    if (daysToGenerate >= 5) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-05`,
        name: 'Netflix',
        amount: 15.99,
        category: 'Subscriptions',
        type: 'regular',
        excluded: false,
      });
    }
    if (daysToGenerate >= 10) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-10`,
        name: 'Spotify',
        amount: 10.99,
        category: 'Subscriptions',
        type: 'regular',
        excluded: false,
      });
    }

    // Utilities - 15th
    if (daysToGenerate >= 15) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        name: 'Electric Co',
        amount: Math.round((80 + Math.random() * 40) * 100) / 100,
        category: 'Utilities',
        type: 'regular',
        excluded: false,
      });
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        name: 'Internet Provider',
        amount: 79.99,
        category: 'Utilities',
        type: 'regular',
        excluded: false,
      });
    }

    // Auto loan - 20th
    if (daysToGenerate >= 20) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-20`,
        name: 'Auto Loan Bank',
        amount: 385.00,
        category: 'Loan Payment',
        type: 'regular',
        excluded: false,
      });
    }

    // Paychecks - 1st and 15th (negative amounts = income)
    if (daysToGenerate >= 1) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        name: 'Employer Direct Deposit',
        amount: -3200,
        category: 'Paycheck',
        type: 'income',
        excluded: false,
      });
    }
    if (daysToGenerate >= 15) {
      transactions.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        name: 'Employer Direct Deposit',
        amount: -3200,
        category: 'Paycheck',
        type: 'income',
        excluded: false,
      });
    }
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return transactions;
}

/**
 * Demo debt configuration
 * Different debts than the real user - shows someone earlier in their payoff journey
 */
export const demoDebts = {
  creditCards: [
    {
      id: 'demo-chase',
      name: 'Chase Sapphire',
      currentBalance: 4250,
      startingBalance: 8500,
      apr: 24.99,
      isPrimary: true,
      note: 'Primary payoff target',
    },
    {
      id: 'demo-discover',
      name: 'Discover It',
      currentBalance: 1875,
      startingBalance: 3200,
      apr: 18.99,
      isPrimary: false,
      note: 'Cashback card',
    },
    {
      id: 'demo-citi',
      name: 'Citi Double Cash',
      currentBalance: 0,
      startingBalance: 2100,
      apr: 21.49,
      isPrimary: false,
      note: 'Paid off!',
    },
  ],
  termLoans: [
    {
      id: 'demo-auto',
      name: 'Auto Loan',
      currentBalance: 12500,
      startingBalance: 22000,
      monthlyPayment: 385,
      apr: 5.9,
    },
  ],
  targetDate: new Date('2026-08-01'), // Demo target: August 2026
  peakDebt: 13800, // Sum of starting CC balances
};

/**
 * Demo debt history for charts
 */
export const demoDebtHistory = [
  { date: '2025-08-01', totalDebt: 13800 },
  { date: '2025-09-01', totalDebt: 12900 },
  { date: '2025-10-01', totalDebt: 11800 },
  { date: '2025-11-01', totalDebt: 10500 },
  { date: '2025-12-01', totalDebt: 9200 },
  { date: '2026-01-01', totalDebt: 7800 },
  { date: new Date().toISOString().slice(0, 10), totalDebt: 6125 },
];

/**
 * Demo income configuration
 */
export const demoIncomeConfig = {
  paycheckAmount: 3200,
  paycheckFrequency: 'semi-monthly', // 1st and 15th
  extraIncome: {},
};

/**
 * Demo import history
 */
export const demoImportHistory = [
  {
    id: 'demo-import-1',
    filename: 'bank_export_jan2026.csv',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    totalParsed: 45,
    newAdded: 45,
    duplicatesSkipped: 0,
  },
  {
    id: 'demo-import-2',
    filename: 'credit_card_dec2025.csv',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
    totalParsed: 38,
    newAdded: 38,
    duplicatesSkipped: 0,
  },
];

// Generate and export demo transactions
export const demoTransactions = generateDemoTransactions();

// Calculate demo debt stats (similar to what useDebt calculates)
export function getDemoDebtStats() {
  const ccDebts = demoDebts.creditCards;
  const totalCurrent = ccDebts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalStarting = ccDebts.reduce((sum, d) => sum + d.startingBalance, 0);
  const totalPaid = totalStarting - totalCurrent;
  const percentComplete = Math.round((totalPaid / totalStarting) * 100);

  // Create milestones with full structure
  const milestones = [
    { threshold: 25, reached: percentComplete >= 25, label: '25%', amountNeeded: totalStarting * 0.25, amountRemaining: Math.max(0, totalStarting * 0.25 - totalPaid) },
    { threshold: 50, reached: percentComplete >= 50, label: '50%', amountNeeded: totalStarting * 0.50, amountRemaining: Math.max(0, totalStarting * 0.50 - totalPaid) },
    { threshold: 75, reached: percentComplete >= 75, label: '75%', amountNeeded: totalStarting * 0.75, amountRemaining: Math.max(0, totalStarting * 0.75 - totalPaid) },
    { threshold: 100, reached: percentComplete >= 100, label: '100%', amountNeeded: totalStarting, amountRemaining: Math.max(0, totalStarting - totalPaid) },
  ];

  const nextMilestone = milestones.find(m => !m.reached) || null;

  // Format debts for components that expect this structure
  const targetDebts = ccDebts.map(d => ({
    key: d.id,
    name: d.name,
    original: d.startingBalance,
    current: d.currentBalance,
    apr: d.apr,
    isPrimary: d.isPrimary,
    paidOff: d.startingBalance - d.currentBalance,
    percentagePaid: ((d.startingBalance - d.currentBalance) / d.startingBalance) * 100,
  }));

  const termLoanStats = demoDebts.termLoans.map(d => ({
    key: d.id,
    name: d.name,
    original: d.startingBalance,
    current: d.currentBalance,
    monthlyPayment: d.monthlyPayment,
    apr: d.apr,
    paidOff: d.startingBalance - d.currentBalance,
    percentagePaid: ((d.startingBalance - d.currentBalance) / d.startingBalance) * 100,
  }));

  return {
    // Target CC debt stats (matching useDebt structure)
    currentTargetDebt: totalCurrent,
    targetDebtPaidOff: totalPaid,
    targetPayoffPercentage: percentComplete,
    septemberPeak: totalStarting,

    // Total debt stats
    totalOriginal: totalStarting,
    totalCurrent: totalCurrent,
    totalPaidOff: totalPaid,
    totalPayoffPercentage: percentComplete,

    // Projections
    avgMonthlyPayment: 1500,
    projectedPayoff: demoDebts.targetDate,
    targetPayoffDate: demoDebts.targetDate,
    isOnTrack: true,
    monthsToTarget: 6,
    requiredMonthlyPayment: totalCurrent / 6,

    // Milestones
    milestones,
    nextMilestone,
    recentlyReachedMilestone: null,
    paidOffCards: ccDebts.filter(d => d.currentBalance === 0).map(d => ({ key: d.id, name: d.name })),

    // Categorized debts
    targetDebts,
    managedDebts: [],
    termLoans: termLoanStats,

    // Legacy properties for backwards compatibility
    totalDebt: totalCurrent,
    totalPaid,
    percentComplete,
    peakDebt: demoDebts.peakDebt,
    creditCards: ccDebts,
  };
}
