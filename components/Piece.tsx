import React from 'react';
import type { PieceSymbol, Color } from '../types';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
}

// Using more traditional, Staunton-like SVG paths for a more realistic look.
const pieceSVG: Record<PieceSymbol, string> = {
  p: "M 22.5,9 C 20.5,9 19,10.5 19,12.5 C 19,15.5 22.5,23 22.5,23 C 22.5,23 26,15.5 26,12.5 C 26,10.5 24.5,9 22.5,9 z M 17.5,25 L 27.5,25 L 27.5,28 L 17.5,28 z M 15.5,30 L 29.5,30 L 29.5,33 L 15.5,33 z",
  r: "M 12.5,10 L 12.5,14 L 16.5,14 L 16.5,10 L 20.5,10 L 20.5,14 L 24.5,14 L 24.5,10 L 28.5,10 L 28.5,14 L 32.5,14 L 32.5,10 L 12.5,10 z M 14.5,16 L 30.5,16 L 30.5,28 L 14.5,28 z M 12.5,30 L 32.5,30 L 32.5,34 L 12.5,34 z",
  n: "M 22,10 C 32.5,10 32.5,22 30,22 C 29,22 28.5,21 28.5,20 C 28.5,17.5 26.5,15.5 24.5,14.5 C 23,13.5 21.5,13 20.5,13 C 16.5,13 14.5,16 14.5,20 C 14.5,25 16.5,28 16.5,28 L 14.5,28 C 12.5,28 11.5,26 11.5,23 C 11.5,21.5 12.5,20 12.5,20 C 12.5,19 10.5,18 10.5,17 C 10.5,15 12.5,14 12.5,14 C 12.5,12.5 11.5,11 11.5,10 C 11.5,8 13.5,6 16.5,6 C 18.5,6 20.5,8 22,10 z M 16,30 L 30,30 L 30,34 L 16,34 z",
  b: "M 22.5,8 C 24.5,8 26,9.5 26,11.5 C 26,13.5 22.5,21 22.5,21 C 22.5,21 19,13.5 19,11.5 C 19,9.5 20.5,8 22.5,8 z M 22,10 L 23,10 L 24,13 L 21,13 z M 17.5,23 L 27.5,23 C 29.5,23 29.5,25 27.5,25 L 17.5,25 C 15.5,25 15.5,23 17.5,23 z M 16,27 L 29,27 L 29,30 L 16,30 z M 14,32 L 31,32 L 31,35 L 14,35 z",
  q: "M 11,13 L 15,9 L 19,13 L 23,9 L 27,13 L 31,9 L 35,13 L 23,25 L 11,13 z M 15.5,26 C 15.5,26 18,28 23,28 C 28,28 30.5,26 30.5,26 L 30.5,30 L 15.5,30 z M 13.5,32 L 32.5,32 L 32.5,36 L 13.5,36 z",
  k: "M 20.5,8 L 25.5,8 L 25.5,11 L 28.5,11 L 28.5,14 L 25.5,14 L 25.5,17 L 20.5,17 L 20.5,14 L 17.5,14 L 17.5,11 L 20.5,11 z M 15.5,19 C 15.5,19 18,21 23,21 C 28,21 30.5,19 30.5,19 L 30.5,30 L 15.5,30 z M 13.5,32 L 32.5,32 L 32.5,36 L 13.5,36 z"
};

const PieceComponent: React.FC<PieceProps> = ({ type, color }) => {
  const piecePath = pieceSVG[type];
  const fill = color === 'w' ? 'var(--color-stone-200)' : 'var(--color-stone-800)';
  const stroke = color === 'w' ? 'var(--color-stone-800)' : 'var(--color-stone-300)';

  return (
    <svg 
      viewBox="0 0 45 45" 
      className="w-full h-full z-10"
      style={{ 
        filter: 'drop-shadow(0px 4px 3px rgba(0,0,0,0.4))',
        '--color-stone-200': '#E7E5E4',
        '--color-stone-300': '#D6D3D1',
        '--color-stone-800': '#292524',
       } as React.CSSProperties}
    >
      <path
        d={piecePath}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PieceComponent;