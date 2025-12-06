import React from 'react';

interface GameOverModalProps {
  winner: 'White' | 'Black' | null;
  reason: string;
  onPlayAgain: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, reason, onPlayAgain }) => {
  const getTitle = () => {
    if (reason.toLowerCase().includes('draw') || reason.toLowerCase().includes('stalemate')) {
      return "It's a Draw!";
    }
    return 'Game Over';
  }

  const getMessage = () => {
    if (winner) {
      return `${winner} wins by ${reason}!`;
    }
    return `The game is a draw by ${reason}.`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-800/90 border border-amber-500 p-10 rounded-lg shadow-xl flex flex-col items-center gap-6 text-center">
        <h2 className="text-5xl font-bold text-amber-400 tracking-wider">{getTitle()}</h2>
        <p className="text-3xl text-white">{getMessage()}</p>
        <button
          onClick={onPlayAgain}
          className="mt-4 w-48 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
