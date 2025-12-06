import React from 'react';
import type { Piece, Square } from '../types';
import PieceComponent from './Piece';

interface SquareProps {
  id: Square;
  isDark: boolean;
  piece: Piece | null;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: () => void;
}

const SquareComponent: React.FC<SquareProps> = ({ id, isDark, piece, isSelected, isPossibleMove, isLastMove, isInCheck, onClick }) => {
  const bgClass = isDark ? 'bg-amber-800' : 'bg-amber-300';

  const overlayClass = () => {
    if (isInCheck) return 'bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.7)_0%,_rgba(220,38,38,0)_70%)]';
    if (isLastMove) return 'bg-yellow-400/40';
    return '';
  };

  const selectionClass = isSelected ? 'ring-4 ring-inset ring-cyan-400/80' : '';

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer group ${bgClass} ${selectionClass}`}
    >
      <div className={`absolute inset-0 transition-colors duration-200 ${overlayClass()}`}></div>
      {piece && <PieceComponent type={piece.type} color={piece.color} />}
      {isPossibleMove && (
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.4)_0%,_rgba(255,255,255,0)_60%)] pointer-events-none"></div>
      )}
    </div>
  );
};

export default SquareComponent;
