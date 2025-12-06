import React from 'react';
import type { Piece, Square } from '../types';
import SquareComponent from './Square';
import CapturedPiecesBar from './CapturedPiecesBar';

interface BoardProps {
  fen: string;
  onSquareClick: (square: Square) => void;
  selectedSquare: Square | null;
  possibleMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isFlipped: boolean;
  inCheckSquare: Square | null;
  capturedPieces: { white: Piece[]; black: Piece[] };
}

const fenToBoard = (fen: string): (Piece | null)[][] => {
  if (fen === 'start') {
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const [piecePlacement] = fen.split(' ');
  const rows = piecePlacement.split('/');

  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const char of row) {
      if (isNaN(parseInt(char))) {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as Piece['type'];
        board[rowIndex][colIndex] = { type, color };
        colIndex++;
      } else {
        colIndex += parseInt(char);
      }
    }
  });

  return board;
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 text-center text-amber-200/60 font-bold text-sm select-none flex items-center justify-center">
      {children}
  </div>
);


const Board: React.FC<BoardProps> = ({ fen, onSquareClick, selectedSquare, possibleMoves, lastMove, isFlipped, inCheckSquare, capturedPieces }) => {
  const boardLayout = fenToBoard(fen);

  const board = isFlipped ? boardLayout.slice().reverse().map(row => row.slice().reverse()) : boardLayout;
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const whiteScore = capturedPieces.white.reduce((acc, p) => acc + (pieceValues[p.type] || 0), 0);
  const blackScore = capturedPieces.black.reduce((acc, p) => acc + (pieceValues[p.type] || 0), 0);
  
  const topPieces = isFlipped ? capturedPieces.white : capturedPieces.black;
  const bottomPieces = isFlipped ? capturedPieces.black : capturedPieces.white;
  
  const playerAdvantage = isFlipped ? (blackScore - whiteScore) : (whiteScore - blackScore);
  const opponentAdvantage = -playerAdvantage;

  return (
    <div className="flex flex-col w-full h-full">
      <CapturedPiecesBar pieces={topPieces} advantage={opponentAdvantage} />
      <div className="flex flex-col bg-amber-900 p-2 rounded-md shadow-2xl w-full">
        {/* Top File Labels */}
        <div className="flex pl-6 pr-6 h-6">
            {files.map(file => <Label key={`top-${file}`}>{file}</Label>)}
        </div>
        <div className="flex flex-1">
            {/* Left Rank Labels */}
            <div className="flex flex-col w-6">
                 {ranks.map(rank => <Label key={`left-${rank}`}>{rank}</Label>)}
            </div>
            {/* Board */}
            <div className="grid grid-cols-8 grid-rows-8 aspect-square flex-1">
                {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                    const squareId = `${files[colIndex]}${ranks[rowIndex]}` as Square;
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const isSelected = squareId === selectedSquare;
                    const isPossibleMove = possibleMoves.includes(squareId);
                    const isLastMove = lastMove ? (squareId === lastMove.from || squareId === lastMove.to) : false;
                    const isInCheck = squareId === inCheckSquare;
                    
                    return (
                        <SquareComponent
                        key={squareId}
                        id={squareId}
                        isDark={isDark}
                        piece={piece}
                        isSelected={isSelected}
                        isPossibleMove={isPossibleMove}
                        isLastMove={isLastMove}
                        isInCheck={isInCheck}
                        onClick={() => onSquareClick(squareId)}
                        />
                    );
                    })
                )}
            </div>
            {/* Right Rank Labels */}
            <div className="flex flex-col w-6">
                {ranks.map(rank => <Label key={`right-${rank}`}>{rank}</Label>)}
            </div>
        </div>
        {/* Bottom File Labels */}
        <div className="flex pl-6 pr-6 h-6">
            {files.map(file => <Label key={`bottom-${file}`}>{file}</Label>)}
        </div>
      </div>
      <CapturedPiecesBar pieces={bottomPieces} advantage={playerAdvantage} />
    </div>
  );
};

export default Board;