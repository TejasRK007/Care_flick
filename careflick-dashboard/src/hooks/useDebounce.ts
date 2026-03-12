import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce value updates.
 * Ideal for preventing excessive API calls or state re-evaluations on every keystroke.
 *
 * @param value The raw value you want to evaluate iteratively.
 * @param delay The delay constraints in milliseconds securely defaulting to 300ms.
 * @returns The safely debounced mapped generic string natively.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a debounce timeout safely limiting recursive mappings continuously natively over iterations.
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleans up the timeout constraint precisely if the input changes before the threshold strictly bypassing anomalies
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
