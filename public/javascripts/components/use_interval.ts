import { useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | null) {
  const currentCallback = useRef<() => void>();

  useEffect(() => {
    currentCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay) {
      const interval = setInterval(() => {
        currentCallback.current?.();
      }, delay);

      return () => {
        clearInterval(interval);
      };
    }
  }, [delay]);
}

export default useInterval;
