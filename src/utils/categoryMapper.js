/**
 * Smart Category Mapper
 * 
 * Maps Copilot transaction data to budget categories using a priority system:
 * 1. Tags (highest priority - user intent)
 * 2. Merchant keyword rules
 * 3. Parent category from Copilot
 * 4. Category from Copilot
 * 5. Fallback to Uncategorized
 */

// ============================================================================
// BUDGET CATEGORIES
// ============================================================================

/**
 * All budget categories used in the dashboard
 * Grouped by type for organization
 */
export const BUDGET_CATEGORIES = {
  // Core flexible spending (actively budgeted)
  flexible: [
    'Groceries',
    'Dining',
    'Discretionary',
    'Travel',
    'Dates',
  ],
  
  // Trackable but not in flexible budget
  trackable: [
    'Subscriptions',
    'Tech & AI',
    'Entertainment',
    'Personal Care',
    'Clothing',
    'Shopping', // General shopping - Shops, Home Design, etc.
    'Pet', // Pet supplies and care
    'Hobbies',
    'Vices',
    'Transportation',
    'Health',
    'Donations',
    'Cash',
  ],
  
  // Fixed costs (excluded from discretionary calculations)
  fixed: [
    'Rent',
    'Utilities',
    'Insurance',
    'Loans',
  ],
  
  // Catch-all
  other: [
    'Uncategorized',
  ],
};

// Flatten for easy lookup
export const ALL_CATEGORIES = [
  ...BUDGET_CATEGORIES.flexible,
  ...BUDGET_CATEGORIES.trackable,
  ...BUDGET_CATEGORIES.fixed,
  ...BUDGET_CATEGORIES.other,
];

export const FLEXIBLE_CATEGORIES = BUDGET_CATEGORIES.flexible;
export const TRACKABLE_CATEGORIES = BUDGET_CATEGORIES.trackable;
export const FIXED_CATEGORIES = BUDGET_CATEGORIES.fixed;

// ============================================================================
// MAPPING RULES (Priority Order)
// ============================================================================

/**
 * Tag-based overrides (highest priority)
 * Tags in Copilot directly map to budget categories
 */
export const TAG_RULES = {
  // Custom tags you use in Copilot
  'Date': 'Dates',
  'Dates': 'Dates',
  'Dating': 'Dates',
  'Gas': 'Transportation',
  'API Credits': 'Tech & AI',
  'Electronics + Tech': 'Tech & AI',
  'Work': 'Tech & AI',
  // Vices
  'Cannabis': 'Vices',
  // Health/Donations
  'AlAnon': 'Donations',
  // Subscriptions
  'Disney+': 'Subscriptions',
  'Adobe Creative Cloud': 'Subscriptions',
  'Microsoft Subscriptions': 'Subscriptions',
  // Installments (real expenses, categorize as Tech)
  'MacMini Installment': 'Tech & AI',
};

/**
 * Merchant keyword rules
 * If transaction name contains keyword, map to category
 * Useful for merchants that Copilot miscategorizes
 */
export const MERCHANT_RULES = [
  // Tech & AI
  { keywords: ['Anthropic', 'OpenAI', 'Claude', 'Midjourney', 'Cursor'], category: 'Tech & AI' },
  { keywords: ['Apple Store'], category: 'Tech & AI' }, // Apple hardware purchases

  // Subscriptions (often miscategorized as "Digital Purchase")
  { keywords: ['Apple.com-bill'], category: 'Subscriptions' },
  { keywords: ['Netflix', 'Hulu', 'Spotify', 'Disney+', 'HBO', 'Paramount'], category: 'Subscriptions' },
  { keywords: ['NYTimes', 'Nytimes', 'Obsidian', 'Notion', 'Adobe', 'Microsoft 365'], category: 'Subscriptions' },
  { keywords: ['Splitwise', 'Harvbusrev', 'Clear *clearme'], category: 'Subscriptions' },
  { keywords: ['Kindle Unltd'], category: 'Subscriptions' },

  // Travel (hotels sometimes categorized as "Other")
  { keywords: ['Airbnb', 'VRBO', 'Hotel', 'Marriott', 'Hilton', 'Hyatt', 'Gritti'], category: 'Travel' },
  { keywords: ['Delta Air', 'United Air', 'American Air', 'Southwest', 'Alaska Air'], category: 'Travel' },
  { keywords: ['Avis', 'Hertz', 'Enterprise', 'Budget Rent'], category: 'Travel' },

  // Personal Care
  { keywords: ['Vagaro', 'Lilt', 'Salon', 'Barber', 'Spa'], category: 'Personal Care' },

  // Hobbies
  { keywords: ['Golf', 'TopGolf'], category: 'Hobbies' },
  { keywords: ['Comic Con', 'Emerald City'], category: 'Hobbies' },
  { keywords: ['Mox Boarding House'], category: 'Hobbies' }, // Board game cafe

  // Entertainment
  { keywords: ['Nintendo', 'PlayStation', 'Xbox', 'Steam'], category: 'Entertainment' },
  { keywords: ['Neighbours'], category: 'Entertainment' }, // Nightclub

  // Vices
  { keywords: ['Gazebo Smoke', 'Vape', 'Empire Stores'], category: 'Vices' },

  // Dining (fix miscategorized restaurants)
  { keywords: ['Starbucks', 'Coffee', 'Cafe', 'Espresso', 'Vivace'], category: 'Dining' },
  { keywords: ['Grubhub', 'Doordash', 'Caviar', 'Uber Eats'], category: 'Dining' },
  { keywords: ['Teriyaki', 'Gyros', 'Zushi', 'Pagliacci', 'Dick\'s Drive'], category: 'Dining' },

  // Health
  { keywords: ['Walgreens', 'CVS', 'Rite Aid'], category: 'Health' },
  { keywords: ['Fremont Health Club', 'Gym'], category: 'Health' },
  { keywords: ['Traverse Therapy', 'Simplepractice'], category: 'Health' },

  // Pet
  { keywords: ['Chewy', 'Petco', 'Petsmart'], category: 'Pet' },

  // Groceries (sometimes miscategorized)
  { keywords: ['QFC', 'Safeway', 'Central Co-op', 'Trader Joe', 'Whole Foods', 'PCC'], category: 'Groceries' },

  // Transportation
  { keywords: ['Uber', 'Lyft'], category: 'Transportation' },
  { keywords: ['Airgarage', 'Paybyphone', 'Seattle Meter'], category: 'Transportation' },
  { keywords: ['7-eleven'], category: 'Transportation' }, // Usually gas
  { keywords: ['Shell', 'Chevron', 'Arco', 'Mobil', 'Exxon'], category: 'Transportation' },

  // Donations
  { keywords: ['Wnyc', 'Npr', 'Wikipedia', 'Patreon'], category: 'Donations' },

  // Loans
  { keywords: ['Lending Club', 'LendingClub'], category: 'Loans' },
  { keywords: ['Student Loan', 'Navient', 'Nelnet', 'FedLoan'], category: 'Loans' },
];

/**
 * Parent category mapping
 * Copilot's parent categories → budget categories
 */
export const PARENT_CATEGORY_MAP = {
  'Shopping': 'Discretionary',
  'Car & Transport': 'Transportation',
  'Fitness': 'Health',
  'Fun': 'Entertainment',
  'Rent': 'Rent',
  'Travel & Vacation': 'Travel',
  'Parking': 'Transportation',
  'Shops': 'Shopping',
  'Subscriptions': 'Subscriptions',
  'Entertainment': 'Entertainment',
  'Other': 'Uncategorized',
  'Restaurants': 'Dining',
};

/**
 * Copilot category → Budget category mapping
 * Most comprehensive mapping layer
 * 
 * IMPORTANT: Only Groceries, Dining, Discretionary, Travel, Dates count toward flexible budget
 * Be conservative about what goes into "Discretionary" - it should be true day-to-day choices
 */
export const CATEGORY_MAP = {
  // Groceries (flexible)
  'Groceries': 'Groceries',
  
  // Dining (flexible)
  'Restaurants': 'Dining',
  'Bars & Nightlife': 'Dining',
  'Coffee': 'Dining',
  
  // Discretionary (flexible) - ONLY small, day-to-day discretionary purchases
  // Be conservative here! Large or recurring items should go elsewhere
  'Shops': 'Shopping', // Changed: generic shopping → trackable, not flexible
  'Digital Purchase': 'Subscriptions', // Changed: usually subscriptions/digital services
  'Home Design + Art': 'Shopping', // Changed: often large one-time purchases
  'Home Improvement': 'Shopping', // Changed: not daily discretionary
  
  // Clothing (trackable, not flexible)
  'Clothing': 'Clothing',
  
  // Entertainment (trackable, not flexible)
  'Entertainment': 'Entertainment',
  'Gaming': 'Entertainment',
  'Sports': 'Entertainment',
  
  // Hobbies (trackable)
  'Golf': 'Hobbies',
  'MTG': 'Hobbies',
  
  // Travel (flexible) - but be aware this includes large Airbnb charges
  'Travel & Vacation': 'Travel',
  
  // Personal Care (trackable)
  'Beauty': 'Personal Care',
  'Tattoos': 'Personal Care',
  'Dry Cleaning': 'Personal Care',
  
  // Health (trackable)
  'Health': 'Health',
  'Medical': 'Health',
  'Gym': 'Health',
  
  // Vices (trackable)
  'Vape': 'Vices',
  
  // Subscriptions (trackable)
  'Subscriptions': 'Subscriptions',
  'AI SPEND': 'Tech & AI',
  'Apple Card Installment': 'Tech & AI', // Monthly installment payments for Apple hardware
  
  // Transportation (trackable)
  'Transportation': 'Transportation',
  'Car': 'Transportation',
  'Parking': 'Transportation',
  'Parking Tickets': 'Transportation',
  
  // Pet (trackable - recurring need, not really discretionary)
  'Pet Supplies': 'Pet',
  'Pets Best Insurance': 'Insurance',
  
  // Fixed costs
  'Rent': 'Rent',
  'Utilities': 'Utilities',
  'Phone Bill': 'Utilities',
  'Insurance': 'Insurance',
  'Loan Payment - Lending Club': 'Loans',
  'STUDENT LOANS': 'Loans',
  'Spousal Support': 'Loans',
  
  // Fees
  'Credit Card Interest Charge': 'Loans',
  'Amex Plan-it Fee': 'Loans',
  'ATM FEE REFUND': 'Cash',
  
  // Donations (trackable)
  'Donations': 'Donations',
  'Recurring Donations': 'Donations',
  
  // Cash (trackable)
  '🏧': 'Cash',
  
  // Finance (trackable)
  'Finances': 'Subscriptions',
  'MAILING AND SHIPPING': 'Shopping',
  
  // Other/Misc
  'Other': 'Uncategorized',
  'Internal Transfers': 'Uncategorized',
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Smart category mapper with priority system
 * @param {object} transaction - Transaction object with category, parentCategory, tags, name
 * @returns {object} { budgetCategory: string, source: string, confidence: 'high'|'medium'|'low' }
 */
export function mapTransaction(transaction) {
  const { category, parentCategory, tags, name } = transaction;
  
  // 1. Check tag rules (highest priority)
  if (tags) {
    const tagList = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
    for (const tag of tagList) {
      if (TAG_RULES[tag]) {
        return {
          budgetCategory: TAG_RULES[tag],
          source: `tag:${tag}`,
          confidence: 'high',
        };
      }
    }
  }
  
  // 2. Check merchant keyword rules
  if (name) {
    const nameLower = name.toLowerCase();
    for (const rule of MERCHANT_RULES) {
      for (const keyword of rule.keywords) {
        if (nameLower.includes(keyword.toLowerCase())) {
          return {
            budgetCategory: rule.category,
            source: `merchant:${keyword}`,
            confidence: 'high',
          };
        }
      }
    }
  }
  
  // 3. Check parent category
  if (parentCategory && PARENT_CATEGORY_MAP[parentCategory]) {
    return {
      budgetCategory: PARENT_CATEGORY_MAP[parentCategory],
      source: `parent:${parentCategory}`,
      confidence: 'medium',
    };
  }
  
  // 4. Check category map
  if (category && CATEGORY_MAP[category]) {
    return {
      budgetCategory: CATEGORY_MAP[category],
      source: `category:${category}`,
      confidence: 'medium',
    };
  }
  
  // 5. Fallback
  return {
    budgetCategory: 'Uncategorized',
    source: 'fallback',
    confidence: 'low',
  };
}

/**
 * Simple category mapping (backwards compatible)
 * @param {string} copilotCategory - The category from Copilot CSV
 * @returns {string} The budget category
 */
export function mapCategory(copilotCategory) {
  return CATEGORY_MAP[copilotCategory] || 'Uncategorized';
}

/**
 * Check if a budget category counts toward flexible spending
 * @param {string} budgetCategory - The mapped budget category
 * @returns {boolean}
 */
export function isFlexibleCategory(budgetCategory) {
  return FLEXIBLE_CATEGORIES.includes(budgetCategory);
}

/**
 * Check if a transaction should be excluded from budget calculations
 * @param {object} transaction - The transaction object
 * @returns {boolean}
 */
/**
 * Patterns that indicate a transaction is a payment/transfer, not spending
 */
const PAYMENT_PATTERNS = [
  // Credit card payments
  /applecard.*payment/i,
  /apple\s*card.*payment/i,
  /gsbank.*payment/i,
  /amex.*payment/i,
  /american express.*payment/i,
  /bank\s*of\s*america.*payment/i,
  /bofa.*payment/i,
  /chase.*payment/i,
  /discover.*payment/i,
  /capital\s*one.*payment/i,
  /citi.*payment/i,
  /credit\s*card.*payment/i,
  
  // Loan payments
  /lending\s*club.*payment/i,
  /loan.*payment/i,
  /student\s*loan.*payment/i,
  
  // Transfers
  /external\s*withdrawal.*payment/i,
  /external\s*transfer/i,
  /ach\s*payment/i,
  /wire\s*transfer/i,
  // Note: Zelle/Venmo NOT excluded - those are often real payments for things
];

export function shouldExcludeTransaction(transaction) {
  // Exclude if explicitly marked as excluded
  if (transaction.excluded) return true;

  // Exclude income
  if (transaction.type === 'income') return true;

  // Exclude internal transfers
  if (transaction.type === 'internal transfer') return true;

  // Exclude negative amounts (income/refunds)
  if (transaction.amount < 0) return true;

  // Check merchant name against payment patterns
  const merchant = transaction.merchant || transaction.name || '';
  for (const pattern of PAYMENT_PATTERNS) {
    if (pattern.test(merchant)) {
      return true;
    }
  }

  // Check if category indicates a payment
  const category = (transaction.category || '').toLowerCase();
  if (
    category.includes('payment') ||
    category.includes('transfer') ||
    category === 'credit card payment'
  ) {
    return true;
  }

  return false;
}

/**
 * Get all budget categories for display
 * @returns {string[]}
 */
export function getBudgetCategories() {
  return [...FLEXIBLE_CATEGORIES];
}

/**
 * Get transactions that need attention (uncategorized or low confidence)
 * @param {array} transactions - Array of transactions
 * @returns {array} Transactions needing review
 */
export function getTransactionsNeedingAttention(transactions) {
  return transactions.filter(tx => {
    if (shouldExcludeTransaction(tx)) return false;
    
    const mapping = mapTransaction(tx);
    
    // Flag if uncategorized
    if (mapping.budgetCategory === 'Uncategorized') return true;
    
    // Flag if low confidence and high amount
    if (mapping.confidence === 'low' && tx.amount > 50) return true;
    
    // Flag if Copilot category is "Other"
    if (tx.category === 'Other') return true;
    
    return false;
  });
}

// ============================================================================
// BUDGET DEFAULTS
// ============================================================================

/**
 * Get the default budget amounts for each category (Phase 1 - debt payoff mode)
 */
export const DEFAULT_CATEGORY_BUDGETS = {
  Groceries: 600,
  Dining: 400,
  Discretionary: 450,
  Dates: 400,
  Travel: 300,
};

/**
 * Get category budgets for Phase 2 (post-debt, more relaxed)
 */
export const PHASE2_CATEGORY_BUDGETS = {
  Groceries: 800,
  Dining: 600,
  Discretionary: 600,
  Dates: 500,
  Travel: 500,
};
