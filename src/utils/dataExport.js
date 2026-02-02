/**
 * Data Export/Import Utilities
 * Handles backup and restore of all app data
 */

// All localStorage keys used by the app
const APP_STORAGE_KEYS = [
  'finance-transactions',
  'finance-settings',
  'finance-debt',
  'finance-debt-history',
  'finance-income',
  'celebrated-milestones',
];

/**
 * Export all app data as a JSON object
 * @returns {object} All app data
 */
export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: {},
  };

  APP_STORAGE_KEYS.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        data.data[key] = JSON.parse(value);
      }
    } catch (error) {
      console.warn(`Error exporting ${key}:`, error);
    }
  });

  return data;
}

/**
 * Download data as a JSON file
 * @param {string} filename - Name for the download file
 */
export function downloadDataAsJSON(filename = 'finance-dashboard-backup.json') {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a backup file
 * @param {File} file - The JSON backup file
 * @returns {Promise<{success: boolean, message: string, keysRestored?: string[]}>}
 */
export function importDataFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        // Validate backup structure
        if (!backup.data || typeof backup.data !== 'object') {
          resolve({ success: false, message: 'Invalid backup file format' });
          return;
        }
        
        const keysRestored = [];
        
        // Restore each key
        Object.entries(backup.data).forEach(([key, value]) => {
          if (APP_STORAGE_KEYS.includes(key)) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              keysRestored.push(key);
            } catch (error) {
              console.warn(`Error restoring ${key}:`, error);
            }
          }
        });
        
        if (keysRestored.length === 0) {
          resolve({ success: false, message: 'No valid data found in backup file' });
          return;
        }
        
        resolve({
          success: true,
          message: `Restored ${keysRestored.length} data items. Refresh to see changes.`,
          keysRestored,
        });
      } catch (error) {
        resolve({ success: false, message: `Error parsing backup file: ${error.message}` });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Error reading file' });
    };
    
    reader.readAsText(file);
  });
}

/**
 * Get a summary of stored data
 * @returns {object} Summary with counts and sizes
 */
export function getDataSummary() {
  const summary = {};
  let totalSize = 0;
  
  APP_STORAGE_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      const size = new Blob([value]).size;
      totalSize += size;
      
      try {
        const parsed = JSON.parse(value);
        summary[key] = {
          exists: true,
          size: formatBytes(size),
          count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
        };
      } catch {
        summary[key] = { exists: true, size: formatBytes(size), count: null };
      }
    } else {
      summary[key] = { exists: false, size: '0 B', count: 0 };
    }
  });
  
  summary.totalSize = formatBytes(totalSize);
  return summary;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
