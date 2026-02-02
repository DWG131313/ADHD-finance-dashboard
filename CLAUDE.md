# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance dashboard built with React + Vite. Imports transaction data from Copilot (finance app) CSV exports and provides budget tracking, debt monitoring, and spending analysis.

## Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

### Data Flow
- **App.jsx**: Root component that composes all custom hooks and passes data to Dashboard
- **Dashboard.jsx**: Main layout with 4 views (Overview, Transactions, Cash Flow, Trends)
- **localStorage**: All data persists client-side via `useLocalStorage` hook

### Custom Hooks (src/hooks/)
- `useTransactions`: Manages transaction data, CSV import, deduplication
- `useBudget`: Calculates budgets, spending by category, pace tracking for selected month
- `useDebt`: Tracks debt balances and payment history
- `useIncome`: Manages paycheck and extra income tracking
- `useLocalStorage`: Generic localStorage persistence wrapper

### Category System (src/utils/categoryMapper.js)
Smart mapping from Copilot categories to budget categories using priority:
1. Tags (user intent, highest priority)
2. Merchant keyword rules
3. Parent category from Copilot
4. Category from Copilot
5. Fallback to "Uncategorized"

**Flexible budget categories** (tracked against monthly budgets): Groceries, Dining, Discretionary, Travel, Dates

**Trackable categories** (displayed but not in flexible budget): Subscriptions, Tech & AI, Entertainment, Personal Care, Clothing, Shopping, Pet, Hobbies, Vices, Transportation, Health, Donations, Cash

### CSV Import (src/utils/csvParser.js)
Parses Copilot CSV exports with columns: date, name, amount, status, category, parent category, excluded, tags, type, account, etc. Transactions are deduplicated by generated ID (date + name + amount).

## Key Patterns

- Budget has two phases: Phase 1 (debt payoff mode, tighter budgets) and Phase 2 (post-debt, relaxed)
- Transactions are auto-excluded if: marked excluded, income type, internal transfer, negative amount, or matches payment patterns (credit card payments, loan payments)
- Month selection affects all budget/spending calculations throughout the app
