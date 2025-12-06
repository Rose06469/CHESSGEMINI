
import React from 'react';
import PieceComponent from './Piece';
import type { Color } from '../types';

interface PromotionModalProps {
  onPromote: (piece: 'q' | 'r' | 'b' | 'n') => void;
  color: Color;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ onPromote, color }) => {
  const promotionPieces = ['q', 'r', 'b', 'n'] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-800/80 border border-stone-600 p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <h3 className="text-2xl font-bold text-white mb-4">Promote Pawn</h3>
        <div className="flex gap-4">
          {promotionPieces.map(piece => (
            <button
              key={piece}
              onClick={() => onPromote(piece)}
              className="w-20 h-20 bg-stone-700 hover:bg-stone-600 rounded-md transition-transform transform hover:scale-110"
            >
              <PieceComponent type={piece} color={color} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;