# Personal Finance Dashboard - Project Recap

## Overview

A React-based personal finance dashboard that imports CSV exports from Copilot (a finance app) and provides budget pacing visualization, debt tracking, and income management. Built for a specific use case: aggressive credit card debt payoff with a May 2026 target date.

**Live Development Server**: `http://localhost:5175`

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI Framework |
| Vite | 7.2 | Build tool & dev server |
| Tailwind CSS | v4 | Styling |
| Recharts | - | Charts & data visualization |
| Papaparse | - | CSV parsing |
| date-fns | - | Date manipulation |
| localStorage | - | Data persistence |

---

## Features Built

### Phase 1: Core Budget View ✅

**CSV Import & Parsing**
- Drag-and-drop file upload zone
- Parses Copilot CSV exports with automatic field detection
- Transaction deduplication to prevent double-counting
- Smart category mapping from Copilot categories to budget categories

**Budget Pacing**
- Monthly flexible budget tracking
- Weekly budget targets with daily pacing
- Visual progress bars showing spent vs. budget
- Color-coded status: under (green), on-track (yellow), over (red)
- Smart pacing: current month uses today's date, past months show full month

**Category Budgets**
- Tracks spending by category (Food & Dining, Entertainment, etc.)
- Individual progress bars per category
- Configurable budget amounts per category

**Month Navigation**
- Navigate between months to view historical data
- Current month button for quick return

---

### Phase 2: Debt Tracker ✅

**Credit Card Debt Payoff**
- Tracks target credit cards with May 2026 payoff goal
- Progress from starting debt peak
- Overall percentage paid off with animated progress bar

**Payoff Projections**
- Projected payoff date based on average monthly payments
- Required monthly payment to hit May 2026 target
- On-track/behind status indicator
- Months remaining countdown

**Categorized Debt Display**
- **Credit Cards**: All cards in one section (targets + managed)
- **Term Loans**: Personal loan with separate treatment (3-year term, not part of May 2026 goal)

**Quick Edit Mode**
- Edit button directly on Debt Tracker card
- Inline editing of all balances
- Changes save immediately to localStorage

---

### Phase 3: Polish & Extended Features ✅

**Settings Panel** (Modal)
- **Budgets Tab**: Phase selection (1/2), weekly budget, category budgets
- **Income Tab**: Paycheck amount, bi-weekly schedule configuration
- **Debts Tab**: Full editing for balance, original amount, APR, monthly payment
- **Data Tab**: Reset to sample data, clear all data

**Income Tracking**
- Bi-weekly paycheck calculation (auto-detects pay periods per month)
- Reference date system for accurate bi-weekly scheduling
- Extra income logging (stock sales, bonuses)
- Net position display (income - spending)
- Monthly income summary card

**Transaction List**
- Searchable by merchant name
- Filterable by category
- "Needs Attention" indicator for uncategorized/problematic transactions
- Visual category badges with colors

**Cash Flow Calendar**
- Calendar view of the month
- Income and bill dates displayed
- Daily spending totals

**Trend Charts** (Recharts)
- 6-month spending trends
- Debt payoff trends
- Category comparison bar charts

---

## Architecture & Implementation

### Data Flow

```
CSV File → Papaparse → normalizeTransaction() → categoryMapper → localStorage
                                                       ↓
                                              useTransactions hook
                                                       ↓
                                    useBudget / useDebt / useIncome hooks
                                                       ↓
                                                 Dashboard
                                                       ↓
                              BudgetCard / DebtTracker / IncomeCard / etc.
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root component, orchestrates hooks and passes props to Dashboard |
| `src/components/Dashboard.jsx` | Main layout with tab navigation |
| `src/hooks/useTransactions.js` | Transaction storage, CSV import, deduplication |
| `src/hooks/useBudget.js` | Budget calculations, pacing, category spending |
| `src/hooks/useDebt.js` | Debt balances, payoff projections, categorization |
| `src/hooks/useIncome.js` | Paycheck scheduling, extra income, net position |
| `src/hooks/useLocalStorage.js` | Generic localStorage persistence hook |
| `src/utils/csvParser.js` | Papaparse wrapper, field mapping, normalization |
| `src/utils/categoryMapper.js` | Priority-based category mapping, exclusion rules |
| `src/utils/budgetCalculations.js` | Pacing math, currency formatting |

### Category Mapping System

A priority-based system maps Copilot transactions to dashboard budget categories:

```
Priority 1: Tags (e.g., "Date" → Food & Dining)
Priority 2: Merchant Keywords (e.g., "Anthropic" → Tech & AI)
Priority 3: Parent Category (e.g., "Shopping" → Discretionary)
Priority 4: Copilot Category (e.g., "Restaurants" → Food & Dining)
Priority 5: Fallback → Uncategorized
```

### Transaction Exclusion Rules

Certain transactions are automatically excluded from spending calculations:

- Explicitly marked as `excluded` in Copilot
- Type: `income` or `internal transfer`
- Negative amounts (refunds)
- Credit card payments (detected by merchant name patterns)
- Loan payments
- External transfers/ACH payments

### Debt Categories

| Category | Purpose | May 2026 Goal? |
|----------|---------|----------------|
| `target` | Credit cards being aggressively paid off | ✅ Yes |
| `managed` | Under control, just maintaining | ❌ No |
| `termLoan` | Fixed-term loans with regular payments | ❌ No |

---

## Updates & Changes Made

### Category Mapping Improvements

**Problem**: Initial category mapping was too high-level, lumping many things into "Discretionary."

**Solution**: Implemented a priority-based hybrid approach:
- Tags from Copilot take highest priority
- Merchant-specific rules for known vendors
- Parent category mapping as fallback
- More granular categories (Tech & AI, Entertainment, Personal Care, etc.)

### Flexible Budget Over-Calculation Fix

**Problem**: Monthly flexible budget showed $8,897+ which was incorrect.

**Root Cause**: Categories like `Digital Purchase`, `Shops`, `Home Design + Art`, `Pet Supplies` were mapped to "Discretionary" (a flexible category).

**Fix**: Re-mapped these to trackable (non-flexible) categories:
- Digital Purchase → Tech & AI
- Shops → Clothing
- Home Design + Art → Home
- Pet Supplies → Pets

### Credit Card Payment Exclusion

**Problem**: Credit card payments were showing as spending.

**Fix**: Added pattern matching to detect and exclude:
- Credit card payments (various card names)
- Loan payments
- ACH payments and wire transfers

### Debt Tracking Restructure

**Original**: Flat list with "installment" flag.

**Updated**: Categorized system:
- Target debts (CC payoff focus)
- Managed debts (under control)
- Term loans (fixed payment schedule)

System allows marking cards as paid off and updating loan balances.

### Income Tracking Addition

**Problem**: Dashboard showed spending but not income, making it look like overspending when extra debt payments were funded by stock sales.

**Solution**: Added complete income tracking:
- Bi-weekly paycheck calculation with reference date
- Extra income logging per month
- Net position (income - spending) display

---

## Key Learnings

### 1. Understanding the User's Workflow

The dashboard is the **last step** in the financial management workflow:
- Copilot is the source of truth for transactions
- Tags and categorization happen in Copilot
- Dashboard is a visualization/analysis layer
- Any "cleanup" needs to happen upstream in Copilot

This meant building a system that:
- Reads Copilot's data faithfully
- Highlights problems for the user to fix in Copilot
- Doesn't try to be a transaction management system itself

### 2. Bi-Weekly Pay Complexity

Bi-weekly pay (every 14 days) doesn't align with calendar months:
- Some months have 2 paychecks
- Some months have 3 paychecks
- Can't use fixed dates like "1st and 15th"

Solution: Reference date system that calculates forward/backward by 14-day intervals.

### 3. Debt Psychology

The user has a clear mental model of their debt:
- **Target debts**: Must be eliminated by May 2026
- **Managed debts**: Under control, not stressful
- **Term loans**: Fixed payments, separate concern

The UI needed to reflect this mental model, not just show a flat list of debts.

### 4. Data Quality Issues

Real financial data is messy:
- Credit card payments look like spending
- Categories from Copilot aren't always helpful
- Merchants have weird names ("APPLECARD GSBANK")
- "Other" category is a catch-all

Solution: Multi-layered approach:
- Pattern matching for exclusions
- Priority-based category mapping
- "Needs Attention" flagging for review

### 5. Quick Access Matters

Users want to update frequently-changing data (debt balances) without navigating through menus. Adding the "Edit" button directly on the Debt Tracker card made a big UX difference.

---

## File Structure

```
adhd-finance-dashboard/
├── src/
│   ├── App.jsx                    # Root component
│   ├── index.css                  # Tailwind imports + theme
│   ├── main.jsx                   # React entry point
│   │
│   ├── components/
│   │   ├── Dashboard.jsx          # Main layout + tab navigation
│   │   ├── BudgetCard.jsx         # Monthly budget overview
│   │   ├── CategoryBudgets.jsx    # Per-category progress
│   │   ├── DebtTracker.jsx        # Debt payoff tracking
│   │   ├── IncomeCard.jsx         # Income summary + extra income
│   │   ├── FileDropZone.jsx       # CSV drag-and-drop
│   │   ├── SettingsPanel.jsx      # Modal settings
│   │   ├── TransactionList.jsx    # Searchable transaction list
│   │   ├── CashFlowCalendar.jsx   # Calendar view
│   │   ├── TrendCharts.jsx        # Recharts visualizations
│   │   └── ProgressBar.jsx        # Reusable progress bar
│   │
│   ├── hooks/
│   │   ├── useTransactions.js     # Transaction state + CSV import
│   │   ├── useBudget.js           # Budget calculations
│   │   ├── useDebt.js             # Debt tracking + projections
│   │   ├── useIncome.js           # Income + paychecks
│   │   └── useLocalStorage.js     # Persistence helper
│   │
│   ├── utils/
│   │   ├── csvParser.js           # CSV parsing + normalization
│   │   ├── categoryMapper.js      # Category mapping + exclusions
│   │   └── budgetCalculations.js  # Pacing + formatting
│   │
│   └── data/
│       └── sampleTransactions.js  # Demo data + defaults
│
├── Setup Files/
│   ├── PROJECT_SPEC.md            # Original specification
│   ├── QUICKSTART.md              # Setup guide
│   └── sampleData.js              # Sample data reference
│
├── Import Data/
│   └── Transaction Data/
│       └── jan26 transactions.csv # User's real transaction data
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── PROJECT_RECAP.md               # This document
```

---

## Running the Project

```bash
cd /Users/danny/CodingProjects/adhd-finance-dashboard
npm run dev
```

Opens at `http://localhost:5173` (or next available port).

---

## Next Steps / Future Enhancements

Potential future work:
1. **Savings tracking** - Post-debt-payoff savings goals
2. **Budget templates** - Quick switching between Phase 1/2 budgets
3. **Export functionality** - Export reports or summaries
4. **Mobile optimization** - Better responsive design for phone use
5. **Recurring transaction detection** - Auto-identify subscriptions
6. **Goal milestones** - Celebrate debt payoff milestones

---

*Document generated: February 2026*
