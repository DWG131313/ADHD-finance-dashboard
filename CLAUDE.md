# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance dashboard built with React + Vite. Imports transaction data from Copilot (finance app) CSV exports and provides budget tracking, debt monitoring, and spending analysis.

## Deployment

- **Live URL:** https://danny-finance-dashboard.vercel.app
- **GitHub:** https://github.com/DWG131313/danny-finance-dashboard (private)
- **Deploy:** Run `vercel --prod` from project root
- **PWA:** Installable on mobile/desktop via browser install prompt

## Privacy - CRITICAL

**NEVER commit real financial data.** All user data lives in localStorage only.

- `src/data/sampleTransactions.js` - Must contain ONLY generic placeholder data
- `Import Data/` - Gitignored, contains user's CSV exports
- `Screenshots/` - Gitignored
- `*.csv` - Gitignored

If you see real transaction names, amounts, employer info, or debt balances in the codebase, that's a privacy leak that needs immediate fixing.

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

## Features

### Weekly Rollover Budgets
Weekly surplus/deficit carries forward within the month. If you underspend week 1, the extra rolls into week 2. Controlled via `enableRollover` setting in useBudget. UI toggle in BudgetCard.

### Demo Mode
Toggle in Dashboard header shows simulated data without affecting real localStorage data. Uses `sessionStorage` so it resets on tab close. Demo data generated in `src/data/demoData.js`.

### Focus Mode
Quick daily view with:
- Time-aware greeting
- Daily/weekly budget toggle (respects rollover setting)
- Payday countdown and next bill reminder
- Spending streaks
- Direct debt balance updates

### PWA Support
- `public/manifest.json` - App metadata and icons
- `public/sw.js` - Service worker (network-first, cache fallback)
- `public/icons/` - App icons (SVG, 192px, 512px PNG)

## Browser Notes

Safari may have issues with Vite dev server HMR. If the app won't load in Safari during development, try:
- Using `127.0.0.1:5173` instead of `localhost:5173`
- Testing in Chrome during development, Safari for production builds
