import { useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import { useDebt } from './hooks/useDebt';
import { useIncome } from './hooks/useIncome';
import { useDemoMode } from './hooks/useDemoMode';
import {
  demoTransactions,
  demoDebtHistory,
  demoImportHistory,
  getDemoDebtStats,
  demoIncomeConfig,
} from './data/demoData';
import './index.css';

function App() {
  // Demo mode state
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // Load real transactions from localStorage
  const {
    transactions: realTransactions,
    importFromCSV,
    transactionCount: realTransactionCount,
    resetToSampleData,
    clearTransactions,
    importHistory: realImportHistory,
    lastImportDate: realLastImportDate,
    removeImportRecord,
  } = useTransactions();

  // Use demo or real transactions
  const transactions = isDemoMode ? demoTransactions : realTransactions;
  const transactionCount = isDemoMode ? demoTransactions.length : realTransactionCount;
  const importHistory = isDemoMode ? demoImportHistory : realImportHistory;
  const lastImportDate = isDemoMode
    ? new Date(demoImportHistory[0]?.date)
    : realLastImportDate;

  // Calculate budget data based on active transactions
  const {
    selectedMonth,
    setSelectedMonth,
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
    weeklyRollover,
    enableRollover,
    toggleRollover,
  } = useBudget(transactions);

  // Real debt tracking
  const {
    debts: realDebts,
    debtStats: realDebtStats,
    debtHistory: realDebtHistory,
    updateDebtBalance,
    updateDebtDetails,
    resetDebts,
  } = useDebt();

  // Use demo or real debt data
  const debtStats = isDemoMode ? getDemoDebtStats() : realDebtStats;
  const debtHistory = isDemoMode ? demoDebtHistory : realDebtHistory;

  // Format demo debts as object keyed by ID (matching useDebt format)
  const demoDebtsObject = useMemo(() => {
    if (!isDemoMode) return null;
    const stats = getDemoDebtStats();
    const result = {};
    stats.targetDebts.forEach(d => {
      result[d.key] = {
        name: d.name,
        original: d.original,
        current: d.current,
        apr: d.apr,
        category: 'target',
      };
    });
    stats.termLoans.forEach(d => {
      result[d.key] = {
        name: d.name,
        original: d.original,
        current: d.current,
        apr: d.apr,
        monthlyPayment: d.monthlyPayment,
        category: 'termLoan',
      };
    });
    return result;
  }, [isDemoMode]);

  const debts = isDemoMode ? demoDebtsObject : realDebts;

  // Real income tracking
  const {
    config: realIncomeConfig,
    getMonthlyIncome: getRealMonthlyIncome,
    addExtraIncome,
    removeExtraIncome,
    updatePaycheckSettings,
  } = useIncome();

  // Demo monthly income calculation
  const getDemoMonthlyIncome = useMemo(() => {
    return () => ({
      paychecks: {
        count: 2,
        amount: demoIncomeConfig.paycheckAmount,
        total: demoIncomeConfig.paycheckAmount * 2,
        dates: ['1st', '15th'],
      },
      extraIncome: [],
      totalIncome: demoIncomeConfig.paycheckAmount * 2,
    });
  }, []);

  // Use demo or real income
  const incomeConfig = isDemoMode ? demoIncomeConfig : realIncomeConfig;
  const monthlyIncome = isDemoMode
    ? getDemoMonthlyIncome()
    : getRealMonthlyIncome(selectedMonth);

  // Handle data reset
  const handleResetData = (type) => {
    if (isDemoMode) return; // Don't allow resets in demo mode

    if (type === 'transactions') {
      resetToSampleData();
    } else if (type === 'all') {
      clearTransactions();
      resetDebts();
      localStorage.removeItem('finance-settings');
      localStorage.removeItem('finance-income');
      localStorage.removeItem('celebrated-milestones');
      window.location.reload();
    }
  };

  // No-op functions for demo mode (prevent modifications)
  const noOp = () => {};

  return (
    <Dashboard
      // Demo mode
      isDemoMode={isDemoMode}
      toggleDemoMode={toggleDemoMode}
      // Budget data
      monthInfo={monthInfo}
      weeklyBudget={weeklyBudget}
      setWeeklyBudget={isDemoMode ? noOp : setWeeklyBudget}
      categoryBudgets={categoryBudgets}
      setCategoryBudgets={isDemoMode ? noOp : setCategoryBudgets}
      totalMonthlyBudget={totalMonthlyBudget}
      categorySpending={categorySpending}
      totalFlexibleSpending={totalFlexibleSpending}
      monthlyPaceStatus={monthlyPaceStatus}
      categoryPaceStatus={categoryPaceStatus}
      budgetPhase={budgetPhase}
      setBudgetPhase={isDemoMode ? noOp : setBudgetPhase}
      // Weekly rollover
      weeklyRollover={weeklyRollover}
      enableRollover={enableRollover}
      toggleRollover={isDemoMode ? noOp : toggleRollover}
      // Debt data
      debtStats={debtStats}
      debts={debts}
      debtHistory={debtHistory}
      updateDebtBalance={isDemoMode ? noOp : updateDebtBalance}
      updateDebtDetails={isDemoMode ? noOp : updateDebtDetails}
      // Income data
      monthlyIncome={monthlyIncome}
      incomeConfig={incomeConfig}
      addExtraIncome={isDemoMode ? noOp : addExtraIncome}
      removeExtraIncome={isDemoMode ? noOp : removeExtraIncome}
      updatePaycheckSettings={isDemoMode ? noOp : updatePaycheckSettings}
      // Transaction data
      transactions={transactions}
      onFileUpload={isDemoMode ? noOp : importFromCSV}
      transactionCount={transactionCount}
      onResetData={handleResetData}
      importHistory={importHistory}
      lastImportDate={lastImportDate}
      removeImportRecord={isDemoMode ? noOp : removeImportRecord}
      onClearData={isDemoMode ? noOp : clearTransactions}
      // Month navigation
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
    />
  );
}

export default App;
