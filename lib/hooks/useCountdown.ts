import { useState, useEffect, useCallback } from 'react';

export function useCountdown(timestamp: number, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = timestamp * 1000 - Date.now();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft < 1) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timestamp, onExpire]);

  const formatTime = useCallback((seconds: number) => {
    if (seconds === 0) {
      return 'Expired';
    }

    const secs = seconds % 60;
    return `${secs.toString()}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isExpired: timeLeft === 0,
  };
}
