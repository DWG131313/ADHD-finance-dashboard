import { useState, useCallback } from 'react';
import { isValidCSVFile } from '../utils/csvParser';

/**
 * Drag-and-drop zone for CSV file upload
 */
export function FileDropZone({ onFileUpload, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', message: string }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find((f) => isValidCSVFile(f));

      if (!csvFile) {
        setUploadStatus({
          type: 'error',
          message: 'Please drop a CSV file',
        });
        setTimeout(() => setUploadStatus(null), 3000);
        return;
      }

      setUploadStatus({ type: 'loading', message: 'Processing...' });

      try {
        const result = await onFileUpload(csvFile);
        if (result.success) {
          setUploadStatus({
            type: 'success',
            message: result.count > 0
              ? `Added ${result.count} new transactions`
              : 'No new transactions (all duplicates)',
          });
        } else {
          setUploadStatus({
            type: 'error',
            message: result.error || 'Failed to process file',
          });
        }
      } catch (error) {
        setUploadStatus({
          type: 'error',
          message: error.message || 'Failed to process file',
        });
      }

      setTimeout(() => setUploadStatus(null), 4000);
    },
    [onFileUpload, disabled]
  );

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    if (disabled) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Simulate drop event
        handleDrop({
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: { files: [file] },
        });
      }
    };
    input.click();
  }, [disabled, handleDrop]);

  // Determine visual state
  let borderClass = 'border-gray-600';
  let bgClass = 'bg-gray-800/30';

  if (isDragging) {
    borderClass = 'border-accent';
    bgClass = 'bg-accent/10';
  } else if (uploadStatus?.type === 'success') {
    borderClass = 'border-success';
    bgClass = 'bg-success/10';
  } else if (uploadStatus?.type === 'error') {
    borderClass = 'border-danger';
    bgClass = 'bg-danger/10';
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-6
        transition-all duration-200 cursor-pointer
        ${borderClass} ${bgClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-accent/5'}
      `}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {uploadStatus?.type === 'loading' ? (
          <>
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-text-muted">{uploadStatus.message}</span>
          </>
        ) : uploadStatus ? (
          <>
            <span
              className={`text-2xl mb-2 ${
                uploadStatus.type === 'success' ? 'text-success' : 'text-danger'
              }`}
            >
              {uploadStatus.type === 'success' ? '✓' : '✕'}
            </span>
            <span
              className={
                uploadStatus.type === 'success' ? 'text-success' : 'text-danger'
              }
            >
              {uploadStatus.message}
            </span>
          </>
        ) : (
          <>
            <svg
              className="w-10 h-10 text-text-muted mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-text mb-1">
              Drop CSV file here
            </span>
            <span className="text-sm text-text-muted">
              or click to browse
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default FileDropZone;
