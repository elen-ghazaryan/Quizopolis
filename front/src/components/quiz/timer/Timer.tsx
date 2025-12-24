import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import style from "./timer.module.css"

interface QuizTimerProps {
  isRunning: boolean;
}

export const QuizTimer = ({ isRunning }: QuizTimerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={style.timerBox}>
      <Clock size={20} />
      <span className={style.timerText}>{formatTime(seconds)}</span>
    </div>
  );
};
