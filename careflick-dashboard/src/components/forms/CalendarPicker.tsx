import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './CalendarPicker.css';

interface CalendarPickerProps {
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  label: string;
  name?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CalendarPicker = React.forwardRef<HTMLInputElement, CalendarPickerProps>(
  ({ value, onChange, error, label, name, ...rest }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the current value (YYYY-MM-DD)
    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    // Close calendar on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // When value changes externally, sync the view
    useEffect(() => {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
      }
    }, [value]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(y => y - 1);
      } else {
        setViewMonth(m => m - 1);
      }
    };

    const nextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(y => y + 1);
      } else {
        setViewMonth(m => m + 1);
      }
    };

    const selectDay = (day: number) => {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      onChange(`${viewYear}-${mm}-${dd}`);
      setIsOpen(false);
    };

    const formatDisplayDate = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isToday = (day: number) =>
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate();

    const isSelected = (day: number) =>
      selectedDate &&
      viewYear === selectedDate.getFullYear() &&
      viewMonth === selectedDate.getMonth() &&
      day === selectedDate.getDate();

    // Build calendar grid
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

    const calendarCells: { day: number; type: 'prev' | 'current' | 'next' }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarCells.push({ day: prevMonthDays - i, type: 'prev' });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      calendarCells.push({ day: d, type: 'current' });
    }
    // Next month leading days
    const remaining = 42 - calendarCells.length;
    for (let d = 1; d <= remaining; d++) {
      calendarCells.push({ day: d, type: 'next' });
    }

    return (
      <div className="form-group calendar-picker-wrapper" ref={containerRef}>
        <label className="form-label">{label}</label>

        {/* Hidden input for react-hook-form */}
        <input
          type="hidden"
          ref={ref}
          name={name}
          value={value || ''}
          {...rest}
        />

        <button
          type="button"
          className={`calendar-trigger form-control ${error ? 'is-invalid' : ''} ${value ? 'has-value' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar size={16} className="calendar-trigger-icon" />
          <span>{value ? formatDisplayDate(value) : 'Select a date...'}</span>
        </button>

        {isOpen && (
          <div className="calendar-dropdown">
            <div className="calendar-nav">
              <button type="button" className="calendar-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={18} />
              </button>
              <span className="calendar-nav-title">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button type="button" className="calendar-nav-btn" onClick={nextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-grid">
              {DAY_LABELS.map(d => (
                <div key={d} className="calendar-day-label">{d}</div>
              ))}
              {calendarCells.map((cell, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`calendar-day
                    ${cell.type !== 'current' ? 'other-month' : ''}
                    ${cell.type === 'current' && isToday(cell.day) ? 'today' : ''}
                    ${cell.type === 'current' && isSelected(cell.day) ? 'selected' : ''}
                  `}
                  onClick={() => {
                    if (cell.type === 'current') {
                      selectDay(cell.day);
                    } else if (cell.type === 'prev') {
                      prevMonth();
                    } else {
                      nextMonth();
                    }
                  }}
                >
                  {cell.day}
                </button>
              ))}
            </div>

            <div className="calendar-footer">
              <button
                type="button"
                className="calendar-today-btn"
                onClick={() => {
                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                  const dd = String(today.getDate()).padStart(2, '0');
                  onChange(`${today.getFullYear()}-${mm}-${dd}`);
                  setIsOpen(false);
                }}
              >
                Today
              </button>
            </div>
          </div>
        )}

        {error && <span className="invalid-feedback">{error}</span>}
      </div>
    );
  }
);

CalendarPicker.displayName = 'CalendarPicker';

export default CalendarPicker;
