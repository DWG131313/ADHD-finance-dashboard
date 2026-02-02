import { useMemo, useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/budgetCalculations';
import { getDaysInMonth } from '../utils/dateUtils';

/**
 * Event detail popup card
 */
function EventPopup({ events, currentIndex, onIndexChange, position, onClose }) {
  const popupRef = useRef(null);
  const event = events[currentIndex];
  const hasMultiple = events.length > 1;

  // Close on click outside - delay adding listener to avoid immediate close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Wait for next frame so the opening click doesn't trigger close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const isIncome = event.type === 'income';
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-background-card border border-gray-600 rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[320px] animate-popup-in"
      style={{
        left: Math.min(position.x, window.innerWidth - 340),
        top: Math.min(position.y + 10, window.innerHeight - 250),
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isIncome ? 'bg-success' : 'bg-danger'
            }`}
          />
          <h3 className="font-semibold text-text">{event.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Amount */}
      <div
        className={`text-2xl font-bold mb-3 ${
          isIncome ? 'text-success' : 'text-danger'
        }`}
      >
        {isIncome ? '+' : '-'}{formatCurrency(event.amount)}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Date</span>
          <span className="text-text">{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Type</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            isIncome
              ? 'bg-success/20 text-success'
              : event.type === 'bill'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-danger/20 text-danger'
          }`}>
            {event.type === 'income' ? 'Income' : event.type === 'bill' ? 'Recurring Bill' : 'Expense'}
          </span>
        </div>
        {event.isRecurring !== undefined && (
          <div className="flex justify-between">
            <span className="text-text-muted">Source</span>
            <span className="text-text">
              {event.isRecurring ? 'Scheduled' : 'From Transactions'}
            </span>
          </div>
        )}
        {event.frequency && (
          <div className="flex justify-between">
            <span className="text-text-muted">Frequency</span>
            <span className="text-text">
              {event.frequency === 'bimonthly-even' || event.frequency === 'bimonthly-odd'
                ? 'Every other month'
                : 'Monthly'}
            </span>
          </div>
        )}
        {event.note && (
          <div className="pt-2 border-t border-gray-700">
            <span className="text-text-muted text-xs">{event.note}</span>
          </div>
        )}
      </div>

      {/* Navigation for multiple events */}
      {hasMultiple && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-text-muted">
            {currentIndex + 1} of {events.length}
          </span>
          <button
            onClick={() => onIndexChange(Math.min(events.length - 1, currentIndex + 1))}
            disabled={currentIndex === events.length - 1}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Default recurring bills configuration
 * frequency: 'monthly' (default), 'bimonthly-odd' (Jan, Mar, May...), 'bimonthly-even' (Feb, Apr, Jun...)
 */
const DEFAULT_RECURRING_BILLS = [
  // Fixed monthly bills
  { name: 'Rent', amount: 3675, dayOfMonth: 2, type: 'bill' },
  { name: 'Lending Club', amount: 609, dayOfMonth: 4, type: 'bill' },
  { name: 'Student Loan', amount: 577.82, dayOfMonth: 14, type: 'bill' },
  { name: 'Pet Insurance', amount: 137.36, dayOfMonth: 15, type: 'bill' },
  { name: 'Car Insurance', amount: 123.93, dayOfMonth: 16, type: 'bill' },
  { name: 'Comcast', amount: 103, dayOfMonth: 4, type: 'bill' },
  { name: 'AT&T', amount: 112, dayOfMonth: 30, type: 'bill' },

  // Seasonal/variable - using average
  { name: 'PSE', amount: 80, dayOfMonth: 13, type: 'bill', note: 'Seasonal - varies' },

  // Bi-monthly utilities (every other month)
  { name: 'Seattle City Light', amount: 200, dayOfMonth: 7, type: 'bill', frequency: 'bimonthly-even' },
  { name: 'Seattle Utilities', amount: 350, dayOfMonth: 25, type: 'bill', frequency: 'bimonthly-even' },
];

/**
 * Bi-weekly paycheck configuration
 * anchorDate: A known paycheck date to calculate from
 */
const PAYCHECK_CONFIG = {
  amount: 5100,
  anchorDate: new Date('2026-01-30'), // Most recent known paycheck
  intervalDays: 14, // Bi-weekly
};

/**
 * Calculate the next paycheck date from today
 * @returns {{ date: Date, daysUntil: number }}
 */
function getNextPaycheck() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const anchor = new Date(PAYCHECK_CONFIG.anchorDate);
  anchor.setHours(0, 0, 0, 0);
  const interval = PAYCHECK_CONFIG.intervalDays;

  // Calculate days from anchor to today
  const daysDiff = Math.floor((today - anchor) / (1000 * 60 * 60 * 24));

  // Find the next paycheck on or after today
  const periodsFromAnchor = Math.ceil(daysDiff / interval);
  const nextPayday = new Date(anchor);
  nextPayday.setDate(anchor.getDate() + periodsFromAnchor * interval);

  // If next payday is before today (edge case), add one more period
  if (nextPayday < today) {
    nextPayday.setDate(nextPayday.getDate() + interval);
  }

  const daysUntil = Math.ceil((nextPayday - today) / (1000 * 60 * 60 * 24));

  return { date: nextPayday, daysUntil };
}

/**
 * Calculate bi-weekly paycheck dates for a given month
 * @param {Date} monthDate - The month to get paychecks for
 * @returns {Array} Array of paycheck objects with dates
 */
function getPaychecksForMonth(monthDate) {
  const paychecks = [];
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // Start from anchor and work backwards/forwards to find paychecks in this month
  const anchor = new Date(PAYCHECK_CONFIG.anchorDate);
  const interval = PAYCHECK_CONFIG.intervalDays;

  // Calculate days from anchor to month start
  const daysDiff = Math.floor((monthStart - anchor) / (1000 * 60 * 60 * 24));

  // Find the first paycheck on or after month start
  const periodsFromAnchor = Math.floor(daysDiff / interval);
  let currentPayday = new Date(anchor);
  currentPayday.setDate(anchor.getDate() + periodsFromAnchor * interval);

  // If we're before month start, move forward one period
  if (currentPayday < monthStart) {
    currentPayday.setDate(currentPayday.getDate() + interval);
  }

  // Collect all paychecks in this month
  while (currentPayday <= monthEnd) {
    if (currentPayday >= monthStart) {
      const dateKey = `${currentPayday.getFullYear()}-${String(currentPayday.getMonth() + 1).padStart(2, '0')}-${String(currentPayday.getDate()).padStart(2, '0')}`;
      paychecks.push({
        name: 'Paycheck',
        amount: PAYCHECK_CONFIG.amount,
        type: 'income',
        date: dateKey,
        isRecurring: true,
      });
    }
    currentPayday.setDate(currentPayday.getDate() + interval);
  }

  return paychecks;
}

/**
 * Day cell in the calendar
 */
function DayCell({ day, events, isToday, isCurrentMonth, onEventClick }) {
  const hasIncome = events.some((e) => e.type === 'income');
  const hasBills = events.some((e) => e.type === 'bill');
  const hasExpense = events.some((e) => e.type === 'expense');

  const totalIncome = events
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBills = events
    .filter((e) => e.type === 'bill' || e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleClick = (e) => {
    if (events.length > 0 && onEventClick) {
      // If single event, show it directly. If multiple, show first one (could enhance to show list)
      onEventClick(events, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`min-h-[80px] p-1.5 border-b border-r border-gray-700 ${
        !isCurrentMonth ? 'bg-gray-900/50' : ''
      } ${isToday ? 'bg-accent/10 ring-1 ring-accent ring-inset' : ''} ${
        events.length > 0 ? 'cursor-pointer hover:bg-gray-800/50 transition-colors' : ''
      }`}
    >
      {/* Day number */}
      <div
        className={`text-xs font-medium mb-1 ${
          isToday
            ? 'text-accent'
            : isCurrentMonth
            ? 'text-text-muted'
            : 'text-gray-600'
        }`}
      >
        {day}
      </div>

      {/* Events summary */}
      {events.length > 0 && (
        <div className="space-y-0.5">
          {hasIncome && (
            <div className="text-[10px] px-1 py-0.5 rounded bg-success/20 text-success truncate">
              +{formatCurrency(totalIncome)}
            </div>
          )}
          {(hasBills || hasExpense) && (
            <div className="text-[10px] px-1 py-0.5 rounded bg-danger/20 text-danger truncate">
              -{formatCurrency(totalBills)}
            </div>
          )}
          {/* Show first event name if only one */}
          {events.length === 1 && (
            <div className="text-[10px] text-text-muted truncate">
              {events[0].name}
            </div>
          )}
          {events.length > 1 && (
            <div className="text-[10px] text-text-muted">
              {events.length} items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Upcoming events list
 */
function UpcomingEvents({ events, daysAhead = 14, onEventClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= daysAhead;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcoming.length === 0) {
    return (
      <div className="text-sm text-text-muted text-center py-4">
        No upcoming events in the next {daysAhead} days
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcoming.map((event, idx) => {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        const isIncome = event.type === 'income';

        return (
          <div
            key={idx}
            onClick={(e) => onEventClick?.([event], { x: e.clientX, y: e.clientY })}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  isIncome ? 'bg-success' : 'bg-danger'
                }`}
              />
              <div>
                <div className="text-sm text-text font-medium">{event.name}</div>
                <div className="text-xs text-text-muted">
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {diffDays === 0 && (
                    <span className="ml-1 text-accent">(Today)</span>
                  )}
                  {diffDays === 1 && (
                    <span className="ml-1 text-warning">(Tomorrow)</span>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`font-medium ${isIncome ? 'text-success' : 'text-danger'}`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(event.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Cash flow calendar showing income and bills
 */
export function CashFlowCalendar({ selectedMonth, transactions = [] }) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(selectedMonth);

  // State for event popup
  const [selectedEvents, setSelectedEvents] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const handleEventClick = (events, position) => {
    setSelectedEvents(events);
    setPopupPosition(position);
    setSelectedEventIndex(0);
  };

  const handleClosePopup = () => {
    setSelectedEvents(null);
  };
  const firstDayOfMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  ).getDay();

  // Build events for the month from recurring bills + paychecks + actual transactions
  const monthEvents = useMemo(() => {
    const events = {};
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Add recurring bills
    DEFAULT_RECURRING_BILLS.forEach((bill) => {
      // Check bi-monthly frequency
      const frequency = bill.frequency || 'monthly';
      const monthNum = month + 1; // 1-indexed month

      if (frequency === 'bimonthly-odd' && monthNum % 2 === 0) return; // Skip even months
      if (frequency === 'bimonthly-even' && monthNum % 2 === 1) return; // Skip odd months

      const day = Math.min(bill.dayOfMonth, daysInMonth);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (!events[dateKey]) events[dateKey] = [];
      events[dateKey].push({
        ...bill,
        date: dateKey,
        isRecurring: true,
      });
    });

    // Add bi-weekly paychecks
    const paychecks = getPaychecksForMonth(selectedMonth);
    paychecks.forEach((paycheck) => {
      if (!events[paycheck.date]) events[paycheck.date] = [];
      events[paycheck.date].push(paycheck);
    });

    // Add actual transactions from data
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (
        txDate.getMonth() === month &&
        txDate.getFullYear() === year
      ) {
        if (!events[tx.date]) events[tx.date] = [];
        events[tx.date].push({
          name: tx.name,
          amount: tx.amount,
          type: tx.type === 'income' ? 'income' : 'expense',
          date: tx.date,
          isRecurring: false,
        });
      }
    });

    return events;
  }, [selectedMonth, transactions, daysInMonth]);

  // Build flat list for upcoming events
  const allEvents = useMemo(() => {
    const events = [];
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Add next 60 days of recurring events
    for (let m = 0; m < 2; m++) {
      const eventMonth = new Date(year, month + m, 1);
      const eventYear = eventMonth.getFullYear();
      const eventMonthNum = eventMonth.getMonth();
      const eventDaysInMonth = getDaysInMonth(eventMonth);

      DEFAULT_RECURRING_BILLS.forEach((bill) => {
        // Check bi-monthly frequency
        const frequency = bill.frequency || 'monthly';
        const monthNum = eventMonthNum + 1; // 1-indexed month

        if (frequency === 'bimonthly-odd' && monthNum % 2 === 0) return; // Skip even months
        if (frequency === 'bimonthly-even' && monthNum % 2 === 1) return; // Skip odd months

        const day = Math.min(bill.dayOfMonth, eventDaysInMonth);
        const dateKey = `${eventYear}-${String(eventMonthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        events.push({ ...bill, date: dateKey });
      });

      // Add bi-weekly paychecks
      const paychecks = getPaychecksForMonth(eventMonth);
      paychecks.forEach((paycheck) => {
        events.push(paycheck);
      });
    }

    return events;
  }, [selectedMonth]);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    let income = 0;
    let bills = 0;

    Object.values(monthEvents).forEach((dayEvents) => {
      dayEvents.forEach((event) => {
        if (event.type === 'income') {
          income += event.amount;
        } else {
          bills += event.amount;
        }
      });
    });

    return { income, bills, net: income - bills };
  }, [monthEvents]);

  // Build calendar grid
  const calendarDays = [];
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfMonth + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const isToday =
      isCurrentMonth &&
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear() &&
      dayNum === today.getDate();

    const dateKey = isCurrentMonth
      ? `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      : null;

    calendarDays.push({
      day: isCurrentMonth ? dayNum : '',
      isCurrentMonth,
      isToday,
      events: dateKey ? monthEvents[dateKey] || [] : [],
    });
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-background-card rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-text">Cash Flow</h2>
            <p className="text-sm text-text-muted mt-1">
              Expected income and bills for the month
            </p>
          </div>

          {/* Next paycheck countdown */}
          {(() => {
            const { date, daysUntil } = getNextPaycheck();
            const isToday = daysUntil === 0;
            const isTomorrow = daysUntil === 1;
            const isSoon = daysUntil <= 3;

            return (
              <div className={`text-right px-3 py-2 rounded-lg ${
                isToday ? 'bg-success/20' : isSoon ? 'bg-accent/10' : 'bg-gray-800/50'
              }`}>
                <div className={`text-lg font-bold ${
                  isToday ? 'text-success' : isSoon ? 'text-accent' : 'text-text'
                }`}>
                  {isToday ? 'Today!' : isTomorrow ? 'Tomorrow' : `${daysUntil} days`}
                </div>
                <div className="text-xs text-text-muted">
                  Next paycheck
                  <span className="hidden sm:inline">
                    {' '}• {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Monthly summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-success/10">
            <div className="text-success text-lg font-bold">
              +{formatCurrency(monthlySummary.income)}
            </div>
            <div className="text-xs text-text-muted">Income</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-danger/10">
            <div className="text-danger text-lg font-bold">
              -{formatCurrency(monthlySummary.bills)}
            </div>
            <div className="text-xs text-text-muted">Bills</div>
          </div>
          <div
            className={`text-center p-3 rounded-lg ${
              monthlySummary.net >= 0 ? 'bg-success/10' : 'bg-danger/10'
            }`}
          >
            <div
              className={`text-lg font-bold ${
                monthlySummary.net >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {monthlySummary.net >= 0 ? '+' : ''}{formatCurrency(monthlySummary.net)}
            </div>
            <div className="text-xs text-text-muted">Net</div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-l border-t border-gray-700">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-text-muted border-b border-r border-gray-700 bg-gray-800/50"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {calendarDays.map((cell, idx) => (
            <DayCell
              key={idx}
              day={cell.day}
              events={cell.events}
              isToday={cell.isToday}
              isCurrentMonth={cell.isCurrentMonth}
              onEventClick={handleEventClick}
            />
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Upcoming (Next 14 Days)
        </h3>
        <UpcomingEvents events={allEvents} daysAhead={14} onEventClick={handleEventClick} />
      </div>

      {/* Event detail popup */}
      {selectedEvents && selectedEvents.length > 0 && (
        <EventPopup
          events={selectedEvents}
          currentIndex={selectedEventIndex}
          onIndexChange={setSelectedEventIndex}
          position={popupPosition}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default CashFlowCalendar;
