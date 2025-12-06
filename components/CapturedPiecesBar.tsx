import React from 'react';
import type { Piece } from '../types';
import PieceComponent from './Piece';

interface CapturedPiecesBarProps {
  pieces: Piece[];
  advantage: number;
}

const CapturedPiecesBar: React.FC<CapturedPiecesBarProps> = ({ pieces, advantage }) => {
  return (
    <div className="flex items-center gap-2 h-10 px-2 min-h-[40px]">
      <div className="flex items-center gap-1">
        {pieces.map((piece, index) => (
          <div key={`${piece.color}${piece.type}-${index}`} className="w-5 h-5 opacity-80">
            <PieceComponent type={piece.type} color={piece.color} />
          </div>
        ))}
      </div>
      {advantage > 0 && (
        <span className="text-sm font-bold text-green-400">
          +{advantage}
        </span>
      )}
    </div>
  );
};

export default CapturedPiecesBar;
