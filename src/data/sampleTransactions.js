// Sample transaction data for development and new users
// This is generic placeholder data - not real financial information

export const sampleTransactions = [
  // January 2026
  { date: '2026-01-31', name: 'Grocery Store', amount: 45.67, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2026-01-30', name: 'Coffee Shop', amount: 6.50, category: 'Coffee', type: 'regular', excluded: false },
  { date: '2026-01-28', name: 'Restaurant', amount: 52.30, category: 'Restaurants', type: 'regular', excluded: false },
  { date: '2026-01-26', name: 'Streaming Service', amount: 15.99, category: 'Subscriptions', type: 'regular', excluded: false },
  { date: '2026-01-24', name: 'Gas Station', amount: 48.00, category: 'Car', type: 'regular', excluded: false },
  { date: '2026-01-22', name: 'Loan Payment', amount: 500.00, category: 'Loan Payment', type: 'regular', excluded: false },
  { date: '2026-01-20', name: 'Grocery Store', amount: 78.34, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2026-01-18', name: 'Electric Company', amount: 95.00, category: 'Utilities', type: 'regular', excluded: false },
  { date: '2026-01-15', name: 'Internet Provider', amount: 75.00, category: 'Utilities', type: 'regular', excluded: false },
  { date: '2026-01-14', name: 'Coffee Shop', amount: 5.25, category: 'Coffee', type: 'regular', excluded: false },
  { date: '2026-01-12', name: 'Online Shopping', amount: 67.89, category: 'Shops', type: 'regular', excluded: false },
  { date: '2026-01-10', name: 'Grocery Store', amount: 92.15, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2026-01-08', name: 'Restaurant', amount: 38.50, category: 'Restaurants', type: 'regular', excluded: false },
  { date: '2026-01-05', name: 'Gas Station', amount: 52.00, category: 'Car', type: 'regular', excluded: false },
  { date: '2026-01-02', name: 'Rent Payment', amount: 1500.00, category: 'Rent', type: 'regular', excluded: false },

  // December 2025
  { date: '2025-12-30', name: 'Grocery Store', amount: 65.43, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2025-12-28', name: 'Restaurant', amount: 89.00, category: 'Restaurants', type: 'regular', excluded: false },
  { date: '2025-12-25', name: 'Online Shopping', amount: 150.00, category: 'Shops', type: 'regular', excluded: false },
  { date: '2025-12-22', name: 'Loan Payment', amount: 500.00, category: 'Loan Payment', type: 'regular', excluded: false },
  { date: '2025-12-20', name: 'Clothing Store', amount: 120.00, category: 'Clothing', type: 'regular', excluded: false },
  { date: '2025-12-15', name: 'Grocery Store', amount: 88.76, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2025-12-12', name: 'Internet Provider', amount: 75.00, category: 'Utilities', type: 'regular', excluded: false },
  { date: '2025-12-10', name: 'Gas Station', amount: 45.00, category: 'Car', type: 'regular', excluded: false },
  { date: '2025-12-05', name: 'Coffee Shop', amount: 12.50, category: 'Coffee', type: 'regular', excluded: false },
  { date: '2025-12-02', name: 'Rent Payment', amount: 1500.00, category: 'Rent', type: 'regular', excluded: false },

  // November 2025
  { date: '2025-11-28', name: 'Grocery Store', amount: 110.00, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2025-11-25', name: 'Restaurant', amount: 75.00, category: 'Restaurants', type: 'regular', excluded: false },
  { date: '2025-11-22', name: 'Loan Payment', amount: 500.00, category: 'Loan Payment', type: 'regular', excluded: false },
  { date: '2025-11-20', name: 'Online Shopping', amount: 89.99, category: 'Shops', type: 'regular', excluded: false },
  { date: '2025-11-15', name: 'Grocery Store', amount: 72.34, category: 'Groceries', type: 'regular', excluded: false },
  { date: '2025-11-10', name: 'Gas Station', amount: 50.00, category: 'Car', type: 'regular', excluded: false },
  { date: '2025-11-05', name: 'Gym Membership', amount: 45.00, category: 'Gym', type: 'regular', excluded: false },
  { date: '2025-11-02', name: 'Rent Payment', amount: 1500.00, category: 'Rent', type: 'regular', excluded: false },

  // Sample income
  { date: '2026-01-30', name: 'Employer Paycheck', amount: -2500.00, category: 'Paycheck', type: 'income', excluded: false },
  { date: '2026-01-16', name: 'Employer Paycheck', amount: -2500.00, category: 'Paycheck', type: 'income', excluded: false },
  { date: '2026-01-02', name: 'Employer Paycheck', amount: -2500.00, category: 'Paycheck', type: 'income', excluded: false },
  { date: '2025-12-19', name: 'Employer Paycheck', amount: -2500.00, category: 'Paycheck', type: 'income', excluded: false },
  { date: '2025-12-05', name: 'Employer Paycheck', amount: -2500.00, category: 'Paycheck', type: 'income', excluded: false },
];

// Generic configuration defaults for new users
export const defaultConfig = {
  budgetPhase: 1,
  weeklyBudget: 300,

  categoryBudgets: {
    phase1: {
      Groceries: 400,
      Dining: 200,
      Discretionary: 300,
      Entertainment: 150,
      Transportation: 200,
    },
    phase2: {
      Groceries: 500,
      Dining: 300,
      Discretionary: 400,
      Entertainment: 200,
      Transportation: 250,
    }
  },

  debtBalances: {
    creditCard1: { original: 5000, current: 3500, apr: 18, note: 'Example credit card' },
    creditCard2: { original: 2000, current: 1200, apr: 22, note: 'Example store card' },
    personalLoan: { original: 10000, current: 8000, apr: 10, note: 'Example personal loan' },
  },

  fixedMonthlyCosts: {
    'Streaming': 15.99,
    'Music': 10.99,
    'Cloud Storage': 2.99,
  },

  recurringBills: [
    { name: 'Rent', amount: 1500, dayOfMonth: 1 },
    { name: 'Loan Payment', amount: 500, dayOfMonth: 15 },
    { name: 'Internet', amount: 75, dayOfMonth: 12 },
    { name: 'Electric', amount: 100, dayOfMonth: 18 },
    { name: 'Phone', amount: 80, dayOfMonth: 20 },
  ],

  paycheckSchedule: {
    frequency: 'biweekly',
    typicalDays: [1, 15],
    amount: 2500,
  }
};
