
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

// This hook is no longer used by VideoGrid or WatchPage for storing video metadata,
// as Firebase Firestore is now the source of truth.
// It's kept here in case it's used by other parts of the application or for future features.
function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item !== null) { // Check if item is not null before parsing
            try {
                setStoredValue(JSON.parse(item));
            } catch (error) {
                console.error(`Error parsing localStorage key "${key}" on mount:`, error);
                // If parsing fails, localStorage might be corrupted for this key.
                // Consider falling back to initialValue or clearing the item.
                // For now, we'll keep the initialValue if parsing fails.
                // window.localStorage.setItem(key, JSON.stringify(initialValue)); // Optionally reset
                setStoredValue(initialValue);
            }
        } else {
           // If item is null (doesn't exist), set it to initialValue
           window.localStorage.setItem(key, JSON.stringify(initialValue));
           setStoredValue(initialValue);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // Added initialValue to dependency array

  return [storedValue, setValue];
}

export default useLocalStorage;
