import { useState } from 'react';
import { FileDropZone } from './FileDropZone';

/**
 * Format a date for display
 */
function formatDate(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Data Manager component - handles imports, shows history, and data management
 */
export function DataManager({
  onFileUpload,
  importHistory,
  lastImportDate,
  transactionCount,
  onClearData,
  removeImportRecord,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="bg-background-card rounded-xl p-5 shadow-lg">
      {/* Header with freshness indicator */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Transaction Data</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {transactionCount.toLocaleString()} transactions loaded
          </p>
        </div>
        {lastImportDate && (
          <div className="text-right">
            <div className="text-xs text-text-muted">Last import</div>
            <div className="text-sm text-text font-medium">{formatDate(lastImportDate)}</div>
          </div>
        )}
      </div>

      {/* File upload */}
      <FileDropZone onFileUpload={onFileUpload} />
      <p className="text-xs text-text-muted mt-2">
        Export from Copilot as CSV and drop here
      </p>

      {/* Actions row */}
      <div className="flex gap-2 mt-4">
        {importHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            {showHistory ? 'Hide History' : `Import History (${importHistory.length})`}
          </button>
        )}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-3 py-2 text-sm bg-gray-700 hover:bg-danger/20 text-text-muted hover:text-danger rounded-lg transition-colors"
        >
          Clear Data
        </button>
      </div>

      {/* Import history */}
      {showHistory && importHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-text-muted mb-3">Recent Imports</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {importHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-text truncate" title={record.filename}>
                    {record.filename}
                  </div>
                  <div className="text-xs text-text-muted">
                    {formatDate(record.date)} • {record.newAdded} new
                    {record.duplicatesSkipped > 0 && (
                      <span className="text-warning"> • {record.duplicatesSkipped} skipped</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeImportRecord(record.id)}
                  className="ml-2 p-1 text-text-muted hover:text-danger transition-colors"
                  title="Remove from history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear data confirmation */}
      {showClearConfirm && (
        <div className="mt-4 p-4 bg-danger/10 border border-danger/30 rounded-lg">
          <p className="text-sm text-text mb-3">
            This will permanently delete all {transactionCount.toLocaleString()} transactions and import history. Are you sure?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClearData();
                setShowClearConfirm(false);
              }}
              className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/80 transition-colors"
            >
              Yes, Clear All Data
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 bg-gray-700 text-text rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataManager;
