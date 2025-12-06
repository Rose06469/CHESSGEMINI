import type { Square as ChessJsSquare } from 'chess.js';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Square = ChessJsSquare;
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Piece {
  type: PieceSymbol;
  color: Color;
}