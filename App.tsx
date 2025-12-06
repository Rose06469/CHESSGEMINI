import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Square, Move } from 'chess.js';
import { getAiMove } from './services/geminiService';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import PromotionModal from './components/PromotionModal';
import GameOverModal from './components/GameOverModal';
import Timer from './components/Timer';
import SettingsModal from './components/SettingsModal';
import type { Piece, Difficulty } from './types';

// Augment the global scope to include the Chess object from the CDN
declare global {
  interface Window {
    Chess: any;
  }
}

const App: React.FC = () => {
  const [game, setGame] = useState<any>(null); // Start with null game
  const [fen, setFen] = useState<string>('start');
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);
  const [winner, setWinner] = useState<'White' | 'Black' | null>(null);
  const [inCheckSquare, setInCheckSquare] = useState<Square | null>(null);

  const [startTimeInSeconds, setStartTimeInSeconds] = useState(600);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [whiteTime, setWhiteTime] = useState(startTimeInSeconds);
  const [blackTime, setBlackTime] = useState(startTimeInSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  
  const gameStatus = useMemo(() => {
    if (!game) return 'Select a color to start.';
    if (gameOverReason) return `Game Over: ${gameOverReason}`;
    return `${game.turn() === 'w' ? 'White' : 'Black'}'s turn${game.in_check() ? ' (in check)' : ''}`;
  }, [game, gameOverReason]);

  useEffect(() => {
    if (game) {
        if (game.in_checkmate()) {
            // This is handled by the main game over useEffect
        } else if (game.in_check()) {
            const board = game.board();
            const turnColor = game.turn();
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const piece = board[i][j];
                    if (piece && piece.type === 'k' && piece.color === turnColor) {
                        const file = 'abcdefgh'[j];
                        const rank = 8 - i;
                        setInCheckSquare(`${file}${rank}` as Square);
                        return; // exit after finding the king
                    }
                }
            }
        } else {
            setInCheckSquare(null);
        }
    }
  }, [game, fen]);

  // Game Over Condition checker
  useEffect(() => {
    if (!game || gameOverReason) return;

    if (game.in_checkmate()) {
        setWinner(game.turn() === 'w' ? 'Black' : 'White');
        setGameOverReason('Checkmate');
        setIsTimerRunning(false);
        setInCheckSquare(null);
    } else if (game.in_draw()) {
        setWinner(null);
        setGameOverReason('Draw');
        setIsTimerRunning(false);
    } else if (game.in_stalemate()) {
        setWinner(null);
        setGameOverReason('Stalemate');
        setIsTimerRunning(false);
    } else if (game.in_threefold_repetition()) {
        setWinner(null);
        setGameOverReason('Draw by Repetition');
        setIsTimerRunning(false);
    } else if (game.insufficient_material()) {
        setWinner(null);
        setGameOverReason('Draw by Insufficient Material');
        setIsTimerRunning(false);
    }
  }, [game, fen, gameOverReason]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
        if (game?.turn() === 'w') {
            setWhiteTime(t => {
                if (t <= 1) {
                    setWinner('Black');
                    setGameOverReason('Timeout');
                    setIsTimerRunning(false);
                    return 0;
                }
                return t - 1;
            });
        } else if (game?.turn() === 'b') {
            setBlackTime(t => {
                if (t <= 1) {
                    setWinner('White');
                    setGameOverReason('Timeout');
                    setIsTimerRunning(false);
                    return 0;
                }
                return t - 1;
            });
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, game]);


  const capturedPieces = useMemo<{ white: Piece[], black: Piece[] }>(() => {
    if (!game) return { white: [], black: [] };

    const whiteCaptured: Piece[] = []; // Black pieces captured by White
    const blackCaptured: Piece[] = []; // White pieces captured by Black
    const pieceOrder: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };


    const history = game.history({ verbose: true });
    for (const move of history) {
        if (move.captured) {
            if (move.color === 'w') { // White moved and captured a black piece
                whiteCaptured.push({ type: move.captured, color: 'b' });
            } else { // Black moved and captured a white piece
                blackCaptured.push({ type: move.captured, color: 'w' });
            }
        }
    }

    // Sort the pieces by value (Queen > Rook > etc.)
    whiteCaptured.sort((a, b) => pieceOrder[b.type] - pieceOrder[a.type]);
    blackCaptured.sort((a, b) => pieceOrder[b.type] - pieceOrder[a.type]);


    return { white: whiteCaptured, black: blackCaptured };
  }, [game, fen]);

  const makeAiMove = useCallback(async (currentGame: any) => {
    if (!playerColor || currentGame.game_over() || currentGame.turn() === playerColor) return;
    const aiColor = playerColor === 'w' ? 'b' : 'w';

    setIsAiThinking(true);
    try {
      const aiMove = await getAiMove(currentGame.fen(), currentGame.pgn(), aiColor, difficulty);
      const moveResult = currentGame.move(aiMove, { sloppy: true });
      if (moveResult) {
        setGame(new window.Chess(currentGame.fen())); // Create a new instance to ensure state is fresh
        setFen(currentGame.fen());
        setLastMove({ from: moveResult.from, to: moveResult.to });
      } else {
        console.warn('AI suggested an invalid move:', aiMove);
        // Fallback: make a random move
        const moves = currentGame.moves({ verbose: true });
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const fallbackMove = currentGame.move(randomMove.san);
        if(fallbackMove) {
          setGame(new window.Chess(currentGame.fen()));
          setFen(currentGame.fen());
          setLastMove({ from: fallbackMove.from, to: fallbackMove.to });
        }
      }
    } catch (error) {
      console.error("Error getting AI move:", error);
    } finally {
      setIsAiThinking(false);
    }
  }, [playerColor, difficulty]);

  const startGame = useCallback((color: 'w' | 'b') => {
    const newGame = new window.Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setPlayerColor(color);
    setGameStarted(true);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setIsAiThinking(false);
    setPromotionMove(null);
    setWinner(null);
    setInCheckSquare(null);
    setGameOverReason(null);
    setWhiteTime(startTimeInSeconds);
    setBlackTime(startTimeInSeconds);
    setIsTimerRunning(true);

    if (color === 'b') {
      // AI is white, so it moves first. Delay allows state to update.
      setTimeout(() => makeAiMove(newGame), 100);
    }
  }, [makeAiMove, startTimeInSeconds]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerColor(null);
    setGame(null);
    setFen('start');
    setWinner(null);
    setInCheckSquare(null);
    setIsTimerRunning(false);
    setGameOverReason(null);
  }, []);

  const handleSaveSettings = (settings: { difficulty: Difficulty; time: number }) => {
    setDifficulty(settings.difficulty);
    setStartTimeInSeconds(settings.time);
    setIsSettingsModalOpen(false);
  };
  
  useEffect(() => {
    if (game && game.turn() !== playerColor && !game.game_over() && !isAiThinking) {
      const timer = setTimeout(() => makeAiMove(game), 500); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [fen, game, playerColor, isAiThinking, makeAiMove]);

  const handleSquareClick = (square: Square) => {
    if (!game || game.game_over() || isAiThinking || game.turn() !== playerColor) return;

    if (selectedSquare) {
      const move = possibleMoves.find(m => m.to === square);
      if (move) {
        // Check for promotion
        if (move.flags.includes('p')) {
          setPromotionMove(move);
          return;
        }
        
        const moveResult = game.move(move.san);
        if (moveResult) {
          setFen(game.fen());
          setLastMove({ from: moveResult.from, to: moveResult.to });
        }
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setPossibleMoves(moves);
      }
    }
  };

  const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionMove && game) {
        const moveResult = game.move({
            from: promotionMove.from,
            to: promotionMove.to,
            promotion: piece
        });
        if(moveResult) {
            setFen(game.fen());
            setLastMove({from: moveResult.from, to: moveResult.to});
        }
        setPromotionMove(null);
        setSelectedSquare(null);
        setPossibleMoves([]);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-700 p-8 rounded-lg shadow-2xl text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-wider text-amber-100">Gemini Chess</h1>
            <p className="text-lg text-stone-300 mb-6">Select difficulty and choose your side to start a {startTimeInSeconds / 60}-minute game.</p>
             <div className="mb-8">
                <h2 className="text-xl text-stone-200 mb-3">Difficulty</h2>
                <div className="flex justify-center gap-2">
                    {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${difficulty === level ? 'bg-amber-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-stone-200'}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => startGame('w')}
                    className="w-40 bg-stone-200 text-stone-900 font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-white"
                >
                    Play as White
                </button>
                <button
                    onClick={() => startGame('b')}
                    className="w-40 bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Play as Black
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4 font-sans">
      {isSettingsModalOpen && (
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            currentDifficulty={difficulty}
            currentTime={startTimeInSeconds}
        />
       )}
      {promotionMove && playerColor && <PromotionModal onPromote={handlePromotion} color={playerColor} />}
      {gameOverReason && <GameOverModal winner={winner} reason={gameOverReason} onPlayAgain={resetGame} />}

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        <div className="w-full max-w-[calc(100vh-120px)] md:max-w-xl lg:max-w-2xl">
           <Board 
            fen={fen} 
            onSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves.map(m => m.to)}
            lastMove={lastMove}
            isFlipped={playerColor === 'b'}
            inCheckSquare={inCheckSquare}
            capturedPieces={capturedPieces}
          />
        </div>
        <div className="w-full md:w-80 flex-shrink-0 bg-stone-900/50 backdrop-blur-sm border border-stone-700 p-6 rounded-lg shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-4 tracking-wider text-amber-100">Gemini Chess</h1>
          <div className="grid grid-cols-2 gap-4 my-4">
              <Timer player="White" time={whiteTime} isActive={game?.turn() === 'w' && isTimerRunning} />
              <Timer player="Black" time={blackTime} isActive={game?.turn() === 'b' && isTimerRunning} />
          </div>
          <GameStatus status={gameStatus} isAiThinking={isAiThinking} />
           <div className="text-center mt-4 p-2 bg-stone-800/50 border border-stone-700 rounded-lg">
              <p className="text-md text-stone-300">Difficulty: <span className="font-bold text-amber-300">{difficulty}</span></p>
          </div>
          
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full mt-6 bg-stone-600 hover:bg-stone-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Game Settings
          </button>
          <button
            onClick={resetGame}
            className="w-full mt-2 bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;