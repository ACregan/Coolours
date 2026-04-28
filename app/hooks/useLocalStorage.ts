import { useState } from "react";

type DispatchAction<T> = T | ((prevState: T) => T);

// USAGE:
//   const [count, setCount, clearCount] = useLocalStorage<number>("counter", 0);

export default function useLocalStorage<T>(key: string, initialValue: T) {
  // SSR escape hatch
  const isClient = typeof window !== "undefined";

  function setItem(key: string, value: unknown) {
    if (isClient) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error(err);
      }
    }
  }

  function getItem<T>(key: string): T | undefined {
    if (isClient) {
      try {
        const data = window.localStorage.getItem(key);
        return data ? (JSON.parse(data) as T) : undefined;
      } catch (err) {
        console.error(err);
      }
    }
  }

  function removeItem(key: string) {
    if (isClient) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const [value, setValue] = useState(() => {
    const data = getItem(key);
    return (data || initialValue) as T;
  });

  function handleDispatch(action: DispatchAction<T>) {
    if (typeof action === "function") {
      setValue((prevState) => {
        const newValue = (action as (prevState: T) => T)(prevState);
        setItem(key, newValue);
        return newValue;
      });
    } else {
      setValue(action);
      setItem(key, action);
    }
  }

  function clearState() {
    setValue(undefined as T);
    removeItem(key);
  }

  return [value, handleDispatch, clearState] as const;
}
