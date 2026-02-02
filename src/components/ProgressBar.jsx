/**
 * Reusable progress bar component with color coding
 * Green (<80%), Yellow (80-100%), Red (>100%)
 */
export function ProgressBar({
  value,
  max,
  label = '',
  showPercentage = true,
  showAmount = false,
  size = 'md',
  className = '',
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 100); // For visual bar width

  // Determine color based on percentage
  let colorClass;
  if (percentage > 100) {
    colorClass = 'bg-danger';
  } else if (percentage >= 80) {
    colorClass = 'bg-warning';
  } else {
    colorClass = 'bg-success';
  }

  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const heightClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      {(label || showPercentage || showAmount) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          {label && <span className="text-text-muted">{label}</span>}
          <div className="flex gap-3 text-text">
            {showAmount && (
              <span>
                ${Math.round(value).toLocaleString()} / ${Math.round(max).toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <span className={percentage > 100 ? 'text-danger font-semibold' : ''}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar track */}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${heightClass}`}>
        {/* Progress bar fill */}
        <div
          className={`${heightClass} ${colorClass} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
