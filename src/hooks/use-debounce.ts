/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as React from "react";

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    // Create a timeout to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optional: Generic version with more options
interface DebounceOptions {
  delay?: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useDebouncedValue<T>(
  value: T,
  options: DebounceOptions = {},
): T {
  const {
    delay = 500,
    maxWait = delay * 3,
    leading = false,
    trailing = true,
  } = options;

  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const now = Date.now();

    // Handle leading edge
    if (leading && lastCallTimeRef.current === null) {
      setDebouncedValue(value);
    }

    lastCallTimeRef.current = now;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up max wait timeout if it doesn't exist
    if (!maxWaitTimeoutRef.current && maxWait) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setDebouncedValue(value);
        maxWaitTimeoutRef.current = null;
        lastCallTimeRef.current = null;
      }, maxWait);
    }

    // Set up normal timeout
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        maxWaitTimeoutRef.current && clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = null;
        lastCallTimeRef.current = null;
      }, delay);
    }

    // Cleanup
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      maxWaitTimeoutRef.current && clearTimeout(maxWaitTimeoutRef.current);
    };
  }, [value, delay, maxWait, leading, trailing]);

  return debouncedValue;
}

// Optional: Function debouncing hook
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500,
  deps: React.DependencyList = [],
) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps],
  );
}
