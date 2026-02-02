import { useState, useRef } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { downloadDataAsJSON, importDataFromFile, getDataSummary } from '../utils/dataExport';

/**
 * Editable number input with inline editing
 */
function EditableAmount({ value, onChange, prefix = '$' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    } else {
      setEditValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-text-muted">{prefix}</span>
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-text text-right focus:outline-none focus:border-accent"
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-text font-medium hover:text-accent transition-colors"
    >
      {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </button>
  );
}

/**
 * Data management tab with export/import
 */
function DataTab({ onResetData }) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [dataSummary, setDataSummary] = useState(() => getDataSummary());

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadDataAsJSON(`finance-backup-${date}.json`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true });
    const result = await importDataFromFile(file);
    setImportStatus(result);
    
    if (result.success) {
      setDataSummary(getDataSummary());
    }
    
    // Clear the file input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Backup & Restore */}
      <div>
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Backup & Restore
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 px-4 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-medium">Export Backup</span>
            </div>
            <div className="text-xs opacity-75 mt-0.5 ml-7">
              Download all data as JSON file
            </div>
          </button>

          <button
            onClick={handleImportClick}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-text rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="font-medium">Import Backup</span>
            </div>
            <div className="text-xs text-text-muted mt-0.5 ml-7">
              Restore from a backup file
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importStatus && (
            <div
              className={`p-3 rounded-lg text-sm ${
                importStatus.loading
                  ? 'bg-gray-700 text-text-muted'
                  : importStatus.success
                  ? 'bg-success/20 text-success'
                  : 'bg-danger/20 text-danger'
              }`}
            >
              {importStatus.loading ? 'Importing...' : importStatus.message}
              {importStatus.success && (
                <button
                  onClick={() => window.location.reload()}
                  className="block mt-2 text-xs underline hover:no-underline"
                >
                  Click to reload now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Storage Summary */}
      <div>
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Storage Summary
        </h3>
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
          {dataSummary['finance-transactions']?.exists && (
            <div className="flex justify-between">
              <span className="text-text-muted">Transactions</span>
              <span className="text-text">
                {dataSummary['finance-transactions'].count} items ({dataSummary['finance-transactions'].size})
              </span>
            </div>
          )}
          {dataSummary['finance-debt-history']?.exists && (
            <div className="flex justify-between">
              <span className="text-text-muted">Debt History</span>
              <span className="text-text">
                {dataSummary['finance-debt-history'].count} snapshots
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-700 flex justify-between">
            <span className="text-text-muted">Total Size</span>
            <span className="text-text font-medium">{dataSummary.totalSize}</span>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          All data is stored locally in your browser. Nothing is sent to any server.
        </p>
      </div>

      {/* Reset Options */}
      <div>
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Reset Data
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (confirm('Reset all transactions to sample data? This cannot be undone.')) {
                onResetData?.('transactions');
              }
            }}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-text rounded-lg transition-colors text-left"
          >
            <div className="font-medium">Reset to Sample Data</div>
            <div className="text-xs text-text-muted mt-0.5">
              Replace current transactions with demo data
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear ALL data including transactions, budgets, and debt balances? This cannot be undone.')) {
                onResetData?.('all');
              }
            }}
            className="w-full py-3 px-4 bg-danger/20 hover:bg-danger/30 text-danger rounded-lg transition-colors text-left"
          >
            <div className="font-medium">Clear All Data</div>
            <div className="text-xs opacity-75 mt-0.5">
              Remove everything and start fresh
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings panel for editing budgets, income, and debt balances
 */
export function SettingsPanel({
  isOpen,
  onClose,
  // Budget settings
  budgetPhase,
  setBudgetPhase,
  weeklyBudget,
  setWeeklyBudget,
  categoryBudgets,
  setCategoryBudgets,
  // Income settings
  incomeConfig,
  updatePaycheckSettings,
  // Debt settings
  debts,
  updateDebtBalance,
  updateDebtDetails,
  // Data management
  onResetData,
}) {
  const [activeTab, setActiveTab] = useState('budgets');

  if (!isOpen) return null;

  const tabs = [
    { id: 'budgets', label: 'Budgets' },
    { id: 'income', label: 'Income' },
    { id: 'debts', label: 'Debts' },
    { id: 'data', label: 'Data' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-text">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-text-muted hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'budgets' && (
            <div className="space-y-6">
              {/* Budget Phase */}
              <div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                  Budget Phase
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBudgetPhase(1)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      budgetPhase === 1
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-text-muted hover:bg-gray-600'
                    }`}
                  >
                    <div>Phase 1</div>
                    <div className="text-xs opacity-75 mt-0.5">Debt Payoff</div>
                  </button>
                  <button
                    onClick={() => setBudgetPhase(2)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      budgetPhase === 2
                        ? 'bg-success text-white'
                        : 'bg-gray-700 text-text-muted hover:bg-gray-600'
                    }`}
                  >
                    <div>Phase 2</div>
                    <div className="text-xs opacity-75 mt-0.5">Post-Debt</div>
                  </button>
                </div>
              </div>

              {/* Weekly Budget */}
              <div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                  Weekly Flexible Budget
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-text">Target per week</span>
                  <EditableAmount
                    value={weeklyBudget}
                    onChange={setWeeklyBudget}
                  />
                </div>
              </div>

              {/* Category Budgets */}
              <div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                  Monthly Category Budgets
                </h3>
                <div className="space-y-2">
                  {Object.entries(categoryBudgets).map(([category, budget]) => (
                    <div
                      key={category}
                      className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <span className="text-text">{category}</span>
                      <EditableAmount
                        value={budget}
                        onChange={(newValue) => {
                          setCategoryBudgets({
                            ...categoryBudgets,
                            [category]: newValue,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  Total: {formatCurrency(Object.values(categoryBudgets).reduce((a, b) => a + b, 0))}/month
                </p>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="space-y-6">
              <p className="text-sm text-text-muted">
                Configure your income to see accurate net position calculations.
              </p>

              {/* Paycheck Amount */}
              <div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                  Paycheck Amount
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-text">Net pay (after taxes)</span>
                  <EditableAmount
                    value={incomeConfig?.paycheck?.amount || 5100}
                    onChange={(newValue) => updatePaycheckSettings?.({ amount: newValue })}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Bi-weekly pay = ~{formatCurrency((incomeConfig?.paycheck?.amount || 5100) * 26 / 12)}/month average
                </p>
              </div>

              {/* Pay Schedule */}
              <div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
                  Pay Schedule Reference
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-text-muted text-sm mb-2">
                    Enter a recent pay date to calculate bi-weekly schedule:
                  </p>
                  <input
                    type="date"
                    value={incomeConfig?.paycheck?.referenceDate || '2026-01-17'}
                    onChange={(e) => updatePaycheckSettings?.({ referenceDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-text focus:outline-none focus:border-accent"
                  />
                  <p className="text-xs text-text-muted mt-2">
                    The dashboard will calculate pay dates every 14 days from this date.
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <h4 className="text-accent font-medium text-sm mb-1">About Extra Income</h4>
                <p className="text-xs text-text-muted">
                  Stock sales, bonuses, and other one-time income can be added directly
                  from the Income card on the dashboard Overview.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'debts' && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted mb-4">
                Update balances, APR, and monthly payments for each account.
              </p>
              
              {Object.entries(debts).map(([key, debt]) => (
                <div
                  key={key}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-text font-medium">{debt.name}</h4>
                      {debt.category === 'termLoan' && (
                        <span className="text-xs text-text-muted">Term Loan</span>
                      )}
                    </div>
                  </div>

                  {/* Editable fields grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Current Balance */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="text-xs text-text-muted block mb-1">Current Balance</label>
                      <EditableAmount
                        value={debt.current}
                        onChange={(newValue) => updateDebtBalance(key, newValue)}
                      />
                    </div>

                    {/* Original Balance */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="text-xs text-text-muted block mb-1">Original Balance</label>
                      <EditableAmount
                        value={debt.original}
                        onChange={(newValue) => updateDebtDetails?.(key, { original: newValue })}
                      />
                    </div>

                    {/* APR */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="text-xs text-text-muted block mb-1">APR %</label>
                      <EditableAmount
                        value={debt.apr}
                        onChange={(newValue) => updateDebtDetails?.(key, { apr: newValue })}
                        prefix=""
                      />
                    </div>

                    {/* Monthly Payment */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="text-xs text-text-muted block mb-1">Monthly Payment</label>
                      <EditableAmount
                        value={debt.monthlyPayment || 0}
                        onChange={(newValue) => updateDebtDetails?.(key, { monthlyPayment: newValue })}
                      />
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>{formatCurrency(debt.original - debt.current)} paid off</span>
                      <span>{Math.round(((debt.original - debt.current) / debt.original) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{
                          width: `${((debt.original - debt.current) / debt.original) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <DataTab onResetData={onResetData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
