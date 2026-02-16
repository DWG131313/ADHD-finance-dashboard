/**
 * Reusable tooltip component for icon labels and hints
 * Shows on hover with delay, and on keyboard focus for accessibility
 */
export function Tooltip({ children, text, position = 'bottom' }) {
  if (!text) return children;

  const positionClasses = {
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    bottom: '-top-1 left-1/2 -translate-x-1/2',
    top: '-bottom-1 left-1/2 -translate-x-1/2',
    left: '-right-1 top-1/2 -translate-y-1/2',
    right: '-left-1 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={`
          absolute z-50 px-2.5 py-1.5 text-sm text-white bg-gray-900 rounded-lg shadow-lg
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
          transition-opacity duration-150 delay-300
          pointer-events-none whitespace-nowrap
          ${positionClasses[position]}
        `}
        role="tooltip"
      >
        {text}
        {/* Arrow */}
        <div
          className={`
            absolute w-2 h-2 bg-gray-900 rotate-45
            ${arrowClasses[position]}
          `}
        />
      </div>
    </div>
  );
}

export default Tooltip;
