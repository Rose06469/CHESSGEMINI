import React from 'react';
import type { Piece } from '../types';
import PieceComponent from './Piece';

interface CapturedPiecesProps {
  title: string;
  pieces: Piece[];
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ title, pieces }) => {
  if (pieces.length === 0) {
    return null; // Don't render anything if there are no captured pieces
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-stone-300 mb-2">{title}</h3>
      <div className="p-2 bg-stone-800/50 border border-stone-700 rounded-lg min-h-[48px] flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <div key={`${piece.color}${piece.type}-${index}`} className="w-8 h-8">
            <PieceComponent type={piece.type} color={piece.color} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapturedPieces;
