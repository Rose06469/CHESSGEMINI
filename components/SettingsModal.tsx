import React, { useState, useEffect } from 'react';
import type { Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { difficulty: Difficulty; time: number }) => void;
  currentDifficulty: Difficulty;
  currentTime: number; // in seconds
}

const timeOptions = [
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
];

const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentDifficulty, currentTime }) => {
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty>(currentDifficulty);
  const [tempTime, setTempTime] = useState<number>(currentTime);

  useEffect(() => {
    if (isOpen) {
      setTempDifficulty(currentDifficulty);
      setTempTime(currentTime);
    }
  }, [isOpen, currentDifficulty, currentTime]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ difficulty: tempDifficulty, time: tempTime });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-800/90 border border-stone-600 p-8 rounded-lg shadow-xl flex flex-col w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Game Settings</h2>

        {/* Difficulty Setting */}
        <div className="mb-6">
          <h3 className="text-xl text-stone-200 mb-3">AI Difficulty</h3>
          <div className="flex justify-center gap-2">
            {difficultyOptions.map(level => (
              <button
                key={level}
                onClick={() => setTempDifficulty(level)}
                className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${tempDifficulty === level ? 'bg-amber-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-stone-200'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Time Control Setting */}
        <div className="mb-6">
          <h3 className="text-xl text-stone-200 mb-3">Time Control</h3>
          <div className="flex justify-center gap-2">
            {timeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTempTime(option.value)}
                className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${tempTime === option.value ? 'bg-amber-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-stone-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 text-center mt-2">Time control changes will apply to the next game.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md font-semibold bg-stone-600 hover:bg-stone-500 text-stone-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-md font-semibold bg-amber-700 hover:bg-amber-600 text-white transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
