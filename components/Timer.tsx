import React from 'react';

interface TimerProps {
  player: 'White' | 'Black';
  time: number; // in seconds
  isActive: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const Timer: React.FC<TimerProps> = ({ player, time, isActive }) => {
  const activeClass = isActive ? 'bg-amber-600/80 border-amber-400 text-white' : 'bg-stone-800/60 border-stone-700 text-stone-300';

  return (
    <div className={`p-3 rounded-lg text-center transition-colors duration-300 border ${activeClass}`}>
      <p className="text-sm font-medium">{player}</p>
      <p className="text-2xl font-bold tracking-wider">{formatTime(time)}</p>
    </div>
  );
};

export default Timer;
