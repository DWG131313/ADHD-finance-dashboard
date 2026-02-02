import { useState, useMemo, useEffect } from 'react';
import { BudgetCard } from './BudgetCard';
import { CategoryBudgets } from './CategoryBudgets';
import { DebtTracker } from './DebtTracker';
import { DataManager } from './DataManager';
import { SettingsPanel } from './SettingsPanel';
import { TransactionList } from './TransactionList';
import { CashFlowCalendar } from './CashFlowCalendar';
import { IncomeCard } from './IncomeCard';
import { FocusMode } from './FocusMode';
import { StreakCounter } from './StreakCounter';
import { QuickUpdateFAB } from './QuickUpdateFAB';
import { SpendingTrendChart, DebtTrendChart, CategoryComparisonChart } from './TrendCharts';
import { SpendingTrends } from './SpendingTrends';
import { MonthComparison } from './MonthComparison';
import { InterestSaved } from './InterestSaved';
import { shouldExcludeTransaction } from '../utils/categoryMapper';
import { usePreferences } from '../hooks/usePreferences';
import { useStreaks } from '../hooks/useStreaks';

/**
 * Main dashboard layout component
 */
export function Dashboard({
  // Demo mode
  isDemoMode = false,
  toggleDemoMode,
  // Budget data from useBudget hook
  monthInfo,
  weeklyBudget,
  setWeeklyBudget,
  categoryBudgets,
  setCategoryBudgets,
  totalMonthlyBudget,
  categorySpending,
  totalFlexibleSpending,
  monthlyPaceStatus,
  categoryPaceStatus,
  budgetPhase,
  setBudgetPhase,
  // Weekly rollover
  weeklyRollover,
  enableRollover,
  toggleRollover,
  // Debt data from useDebt hook
  debtStats,
  debts,
  debtHistory,
  updateDebtBalance,
  updateDebtDetails,
  // Income data from useIncome hook
  monthlyIncome,
  incomeConfig,
  addExtraIncome,
  removeExtraIncome,
  updatePaycheckSettings,
  // Transaction data
  transactions,
  onFileUpload,
  transactionCount,
  onResetData,
  importHistory,
  lastImportDate,
  removeImportRecord,
  onClearData,
  // Month navigation
  selectedMonth,
  onMonthChange,
}) {
  const [activeView, setActiveView] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // User preferences including focus mode
  const { focusMode, toggleFocusMode, setFocusMode } = usePreferences();

  // Streak tracking
  const {
    streaks,
    recordUnderBudget,
    recordBalanceUpdate,
    hasUpdatedThisWeek,
    wasUnderBudgetThisWeek,
  } = useStreaks();

  // Calculate total spending for the month (all non-excluded expenses)
  const totalMonthlySpending = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    return transactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        if (txDate < monthStart || txDate > monthEnd) return false;
        if (shouldExcludeTransaction(tx)) return false;
        return true;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, selectedMonth]);

  // Month navigation helpers
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth =
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  // Track under-budget streak when viewing current month
  useEffect(() => {
    if (isCurrentMonth && monthlyPaceStatus.status === 'under') {
      recordUnderBudget();
    }
  }, [isCurrentMonth, monthlyPaceStatus.status, recordUnderBudget]);

  // Handler for when balances are updated
  const handleBalanceUpdateComplete = () => {
    recordBalanceUpdate();
  };

  const views = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'cashflow', label: 'Cash Flow', icon: '📅' },
    { id: 'trends', label: 'Trends', icon: '📈' },
  ];

  // Render Focus Mode if enabled
  if (focusMode) {
    return (
      <>
        <FocusMode
          totalFlexibleSpending={totalFlexibleSpending}
          totalMonthlyBudget={totalMonthlyBudget}
          monthlyPaceStatus={monthlyPaceStatus}
          monthInfo={monthInfo}
          debtStats={debtStats}
          debts={debts}
          updateDebtBalance={updateDebtBalance}
          streaks={streaks}
          weeklyRollover={weeklyRollover}
          enableRollover={enableRollover}
          toggleRollover={toggleRollover}
          onExitFocusMode={() => setFocusMode(false)}
        />
        {/* Settings Panel still accessible */}
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          budgetPhase={budgetPhase}
          setBudgetPhase={setBudgetPhase}
          weeklyBudget={weeklyBudget}
          setWeeklyBudget={setWeeklyBudget}
          categoryBudgets={categoryBudgets}
          setCategoryBudgets={setCategoryBudgets}
          incomeConfig={incomeConfig}
          updatePaycheckSettings={updatePaycheckSettings}
          debts={debts}
          updateDebtBalance={updateDebtBalance}
          updateDebtDetails={updateDebtDetails}
          onResetData={onResetData}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-accent/90 text-white px-4 py-2 text-center text-sm font-medium">
          <span className="mr-2">🎭</span>
          Demo Mode — Viewing simulated data
          <button
            onClick={toggleDemoMode}
            className="ml-3 underline hover:no-underline"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  Financial Dashboard
                  {isDemoMode && (
                    <span className="ml-2 text-sm font-normal text-accent">(Demo)</span>
                  )}
                </h1>
                <p className="text-text-muted text-sm mt-1">
                  {transactionCount} transactions • Phase {budgetPhase}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Month selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-text transition-colors"
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToCurrentMonth}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isCurrentMonth
                      ? 'bg-accent text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-text'
                  }`}
                >
                  {monthInfo.label}
                </button>

                <button
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className={`p-2 rounded-lg transition-colors ${
                    isCurrentMonth
                      ? 'bg-gray-800/50 text-text-muted cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 text-text'
                  }`}
                  aria-label="Next month"
                  title={isCurrentMonth ? "Can't go to future months" : "Next month"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Demo Mode toggle */}
              <button
                onClick={toggleDemoMode}
                className={`p-2 rounded-lg transition-colors btn-interactive ${
                  isDemoMode
                    ? 'bg-accent text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-text'
                }`}
                aria-label="Toggle demo mode"
                title="Demo Mode"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Focus Mode toggle */}
              <button
                onClick={toggleFocusMode}
                className={`p-2 rounded-lg transition-colors btn-interactive ${
                  focusMode
                    ? 'bg-accent text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-text'
                }`}
                aria-label="Toggle focus mode (F)"
                title="Focus Mode (F)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>

              {/* Settings button */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-text transition-colors btn-interactive"
                aria-label="Settings"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* View tabs */}
          <div
            className="flex gap-1 mt-4 -mb-4 overflow-x-auto"
            role="tablist"
            aria-label="Dashboard views"
          >
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                role="tab"
                aria-selected={activeView === view.id}
                aria-controls={`${view.id}-panel`}
                id={`${view.id}-tab`}
                tabIndex={activeView === view.id ? 0 : -1}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeView === view.id
                    ? 'bg-background-card text-text border-t border-l border-r border-gray-700'
                    : 'text-text-muted hover:text-text hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-2" aria-hidden="true">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        {/* Overview View */}
        {activeView === 'overview' && (
          <div
            role="tabpanel"
            id="overview-panel"
            aria-labelledby="overview-tab"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left column - Budget overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Debt progress card - full width */}
              {debtStats && <DebtTracker debtStats={debtStats} updateDebtBalance={updateDebtBalance} />}

              {/* Category budgets */}
              <CategoryBudgets
                categorySpending={categorySpending}
                categoryBudgets={categoryBudgets}
                categoryPaceStatus={categoryPaceStatus}
                monthLabel={monthInfo.label}
              />

              {/* Spending pace chart */}
              <SpendingTrends
                transactions={transactions}
                totalBudget={totalMonthlyBudget}
                selectedMonth={selectedMonth}
                monthLabel={monthInfo.label}
              />

              {/* Month comparison */}
              <MonthComparison
                transactions={transactions}
                selectedMonth={selectedMonth}
                monthLabel={monthInfo.label}
              />
            </div>

            {/* Right column - Actions & Info */}
            <div className="space-y-6">
              {/* Monthly budget card */}
              <BudgetCard
                title="Monthly Flexible Budget"
                spent={totalFlexibleSpending}
                budget={totalMonthlyBudget}
                dayOfMonth={monthInfo.dayOfMonth}
                daysInMonth={monthInfo.daysInMonth}
                paceStatus={monthlyPaceStatus}
                weeklyRollover={weeklyRollover}
                enableRollover={enableRollover}
                toggleRollover={toggleRollover}
              />

              {/* Data Manager - import, history, and clear data */}
              <DataManager
                onFileUpload={onFileUpload}
                importHistory={importHistory}
                lastImportDate={lastImportDate}
                transactionCount={transactionCount}
                onClearData={onClearData}
                removeImportRecord={removeImportRecord}
              />

              {/* Income summary */}
              {monthlyIncome && (
                <IncomeCard
                  monthlyIncome={monthlyIncome}
                  totalSpending={totalMonthlySpending}
                  monthLabel={monthInfo.label}
                  onAddExtraIncome={(entry) => addExtraIncome?.(selectedMonth, entry)}
                  onRemoveExtraIncome={(id) => removeExtraIncome?.(selectedMonth, id)}
                />
              )}

              {/* Budget phase indicator */}
              <div className="bg-background-card rounded-xl p-5 shadow-lg">
                <h2 className="text-lg font-semibold text-text mb-2">
                  Budget Phase
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      budgetPhase === 1
                        ? 'bg-accent/20 text-accent'
                        : 'bg-success/20 text-success'
                    }`}
                  >
                    Phase {budgetPhase}
                  </span>
                  <span className="text-text-muted text-sm">
                    {budgetPhase === 1 ? 'Debt Payoff Mode' : 'Post-Debt Mode'}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  {budgetPhase === 1
                    ? 'Tighter budgets to maximize debt payments'
                    : 'Relaxed budgets with savings focus'}
                </p>
              </div>

              {/* Streak Counter */}
              <StreakCounter
                streaks={streaks}
                hasUpdatedThisWeek={hasUpdatedThisWeek}
                wasUnderBudgetThisWeek={wasUnderBudgetThisWeek}
              />

              {/* Interest Saved (compact) */}
              {debts && debtStats?.targetPayoffDate && (
                <InterestSaved
                  debts={debts}
                  targetDate={debtStats.targetPayoffDate}
                  compact
                />
              )}
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div
            role="tabpanel"
            id="transactions-panel"
            aria-labelledby="transactions-tab"
            className="max-w-4xl mx-auto"
          >
            <TransactionList
              transactions={transactions}
              selectedMonth={selectedMonth}
            />
          </div>
        )}

        {/* Cash Flow View */}
        {activeView === 'cashflow' && (
          <div
            role="tabpanel"
            id="cashflow-panel"
            aria-labelledby="cashflow-tab"
            className="max-w-4xl mx-auto"
          >
            <CashFlowCalendar
              selectedMonth={selectedMonth}
              transactions={transactions}
            />
          </div>
        )}

        {/* Trends View */}
        {activeView === 'trends' && (
          <div
            role="tabpanel"
            id="trends-panel"
            aria-labelledby="trends-tab"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingTrendChart transactions={transactions} months={6} />
              {debtStats && <DebtTrendChart debtStats={debtStats} debtHistory={debtHistory} />}
            </div>
            
            {/* Interest Saved Calculator */}
            {debts && debtStats?.targetPayoffDate && (
              <InterestSaved
                debts={debts}
                targetDate={debtStats.targetPayoffDate}
              />
            )}
            
            <CategoryComparisonChart
              categorySpending={categorySpending}
              categoryBudgets={categoryBudgets}
            />
          </div>
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        budgetPhase={budgetPhase}
        setBudgetPhase={setBudgetPhase}
        weeklyBudget={weeklyBudget}
        setWeeklyBudget={setWeeklyBudget}
        categoryBudgets={categoryBudgets}
        setCategoryBudgets={setCategoryBudgets}
        incomeConfig={incomeConfig}
        updatePaycheckSettings={updatePaycheckSettings}
        debts={debts}
        updateDebtBalance={updateDebtBalance}
        updateDebtDetails={updateDebtDetails}
        onResetData={onResetData}
      />

      {/* Quick Update FAB */}
      <QuickUpdateFAB
        debts={debts}
        updateDebtBalance={updateDebtBalance}
        onUpdateComplete={handleBalanceUpdateComplete}
      />
    </div>
  );
}

export default Dashboard;
