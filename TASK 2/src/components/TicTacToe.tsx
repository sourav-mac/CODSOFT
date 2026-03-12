import { useState, useCallback, useEffect } from 'react';
import { Board, CellValue, checkWinner, isBoardFull, findBestMove, findRandomMove } from '@/lib/minimax';
import { playMoveSound, playWinSound, playLoseSound, playDrawSound } from '@/lib/sounds';
import { Smile, Brain, Bot, Trophy, Cpu, Handshake } from 'lucide-react';

const INITIAL_BOARD: Board = Array(9).fill(null);

type GameStatus = 'playing' | 'human-wins' | 'ai-wins' | 'draw';
type Difficulty = 'easy' | 'medium' | 'impossible';
type GamePhase = 'setup' | 'playing';

export default function TicTacToe() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [humanSymbol, setHumanSymbol] = useState<'X' | 'O'>('X');
  const [difficulty, setDifficulty] = useState<Difficulty>('impossible');
  const [board, setBoard] = useState<Board>([...INITIAL_BOARD]);
  const [isHumanTurn, setIsHumanTurn] = useState(true);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });

  const aiSymbol = humanSymbol === 'X' ? 'O' : 'X';

  const checkGameState = useCallback((newBoard: Board): GameStatus => {
    const { winner, line } = checkWinner(newBoard);
    if (winner === humanSymbol) {setWinLine(line);return 'human-wins';}
    if (winner === aiSymbol) {setWinLine(line);return 'ai-wins';}
    if (isBoardFull(newBoard)) return 'draw';
    return 'playing';
  }, [humanSymbol, aiSymbol]);

  const getAIMove = useCallback((currentBoard: Board): number => {
    if (difficulty === 'easy') {
      return Math.random() < 0.8 ? findRandomMove(currentBoard) : findBestMove(currentBoard, aiSymbol);
    }
    if (difficulty === 'medium') {
      return Math.random() < 0.4 ? findRandomMove(currentBoard) : findBestMove(currentBoard, aiSymbol);
    }
    return findBestMove(currentBoard, aiSymbol);
  }, [difficulty, aiSymbol]);

  useEffect(() => {
    if (phase !== 'playing' || isHumanTurn || status !== 'playing') return;
    const timer = setTimeout(() => {
      const newBoard = [...board];
      const move = getAIMove(newBoard);
      if (move === -1) return;
      newBoard[move] = aiSymbol;
      setBoard(newBoard);
      setMoveHistory((prev) => [...prev, move]);
      playMoveSound(aiSymbol === 'X');
      const newStatus = checkGameState(newBoard);
      setStatus(newStatus);
      if (newStatus === 'ai-wins') {setScores((s) => ({ ...s, ai: s.ai + 1 }));setTimeout(playLoseSound, 200);} else
      if (newStatus === 'draw') {setScores((s) => ({ ...s, draws: s.draws + 1 }));setTimeout(playDrawSound, 200);}
      setIsHumanTurn(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [isHumanTurn, status, board, checkGameState, getAIMove, aiSymbol, phase]);

  const handleCellClick = (index: number) => {
    if (!isHumanTurn || status !== 'playing' || board[index]) return;
    const newBoard = [...board];
    newBoard[index] = humanSymbol;
    setBoard(newBoard);
    setMoveHistory((prev) => [...prev, index]);
    playMoveSound(humanSymbol === 'X');
    const newStatus = checkGameState(newBoard);
    setStatus(newStatus);
    if (newStatus === 'human-wins') {setScores((s) => ({ ...s, human: s.human + 1 }));setTimeout(playWinSound, 200);} else
    if (newStatus === 'playing') setIsHumanTurn(false);else
    if (newStatus === 'draw') {setScores((s) => ({ ...s, draws: s.draws + 1 }));setTimeout(playDrawSound, 200);}
  };

  const startGame = () => {
    setBoard([...INITIAL_BOARD]);
    setWinLine(null);
    setMoveHistory([]);
    setStatus('playing');
    const humanGoesFirst = humanSymbol === 'X';
    setIsHumanTurn(humanGoesFirst);
    setPhase('playing');
  };

  const resetGame = () => {
    setBoard([...INITIAL_BOARD]);
    const humanGoesFirst = humanSymbol === 'X';
    setIsHumanTurn(humanGoesFirst);
    setStatus('playing');
    setWinLine(null);
    setMoveHistory([]);
  };

  const backToSetup = () => {
    setPhase('setup');
    setBoard([...INITIAL_BOARD]);
    setStatus('playing');
    setWinLine(null);
    setMoveHistory([]);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8 bg-background">
        <div className="text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
            Tic-Tac-Toe
          </h1>
          
        </div>

        {/* Symbol choice */}
        <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Play as</span>
          <div className="flex gap-3">
            {(['X', 'O'] as const).map((sym) =>
            <button
              key={sym}
              onClick={() => setHumanSymbol(sym)}
              className={`w-20 h-20 rounded-xl font-mono text-3xl font-bold transition-all duration-200
                  ${humanSymbol === sym ?
              sym === 'X' ?
              'bg-primary text-primary-foreground shadow-lg scale-105' :
              'bg-secondary text-secondary-foreground shadow-lg scale-105' :
              'bg-muted text-muted-foreground hover:bg-muted/80'}`
              }>

                {sym}
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {humanSymbol === 'X' ? 'You go first' : 'AI goes first'}
          </span>
        </div>

        {/* Difficulty */}
        <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</span>
          <div className="flex gap-2">
            {([
            { key: 'easy', label: 'Easy', icon: <Smile className="w-4 h-4" /> },
            { key: 'medium', label: 'Medium', icon: <Brain className="w-4 h-4" /> },
            { key: 'impossible', label: 'Impossible', icon: <Bot className="w-4 h-4" /> }] as
            const).map(({ key, label, icon }) =>
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={`px-4 py-2.5 rounded-xl font-display text-sm font-semibold transition-all duration-200
                  ${difficulty === key ?
              'bg-primary text-primary-foreground shadow-lg scale-105' :
              'bg-muted text-muted-foreground hover:bg-muted/80'}`
              }>

                <span className="flex items-center gap-1.5">{icon} {label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Start */}
        <button
          onClick={startGame}
          className="px-10 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg
                     hover:opacity-90 transition-all active:scale-95 animate-slide-up"
          style={{ animationDelay: '0.3s' }}>

          Start Game
        </button>
      </div>);

  }

  const statusText = {
    'playing': isHumanTurn ? `Your turn (${humanSymbol})` : 'AI is thinking...',
    'human-wins': 'You win!',
    'ai-wins': 'AI wins!',
    'draw': "It's a draw!"
  }[status];

  const StatusIcon = {
    'playing': null,
    'human-wins': <Trophy className="w-5 h-5 inline-block ml-1.5 -mt-0.5" />,
    'ai-wins': <Cpu className="w-5 h-5 inline-block ml-1.5 -mt-0.5" />,
    'draw': <Handshake className="w-5 h-5 inline-block ml-1.5 -mt-0.5" />
  }[status];

  const statusColor = {
    'playing': '',
    'human-wins': 'text-[hsl(var(--win-glow))]',
    'ai-wins': 'text-secondary',
    'draw': 'text-accent-foreground'
  }[status];

  const diffLabel = { easy: 'Easy', medium: 'Medium', impossible: 'Impossible' }[difficulty];
  const DiffIcon = { easy: Smile, medium: Brain, impossible: Bot }[difficulty];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-8 bg-background">
      {/* Header */}
      <div className="text-center animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
          Tic-Tac-Toe
        </h1>
        <button
          onClick={backToSetup}
          className="text-xs text-muted-foreground mt-1 font-mono hover:text-foreground transition-colors inline-flex items-center gap-1">

          <DiffIcon className="w-3.5 h-3.5" /> {diffLabel} · You are {humanSymbol} · Change ↗
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex gap-6 font-mono text-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col items-center gap-1">
          <span className={`font-bold text-lg ${humanSymbol === 'X' ? 'text-[hsl(var(--x-color))]' : 'text-secondary'}`}>{scores.human}</span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">You ({humanSymbol})</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-muted-foreground font-bold text-lg">{scores.draws}</span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Draws</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className={`font-bold text-lg ${aiSymbol === 'X' ? 'text-[hsl(var(--x-color))]' : 'text-secondary'}`}>{scores.ai}</span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">AI ({aiSymbol})</span>
        </div>
      </div>

      {/* Status */}
      <div className={`font-display font-semibold text-xl ${statusColor} animate-slide-up`} style={{ animationDelay: '0.15s' }}>
        {statusText}{StatusIcon}
      </div>

      {/* Board */}
      <div
        className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-card animate-slide-up"
        style={{ boxShadow: 'var(--shadow-board)', animationDelay: '0.2s' }}>

        {board.map((cell, i) =>
        <Cell
          key={i}
          value={cell}
          onClick={() => handleCellClick(i)}
          isWinning={winLine?.includes(i) ?? false}
          isNew={moveHistory[moveHistory.length - 1] === i}
          disabled={!isHumanTurn || status !== 'playing' || !!cell} />

        )}
      </div>

      {/* Reset */}
      {status !== 'playing' &&
      <button
        onClick={resetGame}
        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold
                     hover:opacity-90 transition-all active:scale-95 animate-slide-up">

          Play Again
        </button>
      }
    </div>);

}

/** Individual cell component */
function Cell({
  value,
  onClick,
  isWinning,
  isNew,
  disabled
}: {value: CellValue;onClick: () => void;isWinning: boolean;isNew: boolean;disabled: boolean;}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-24 h-24 md:w-28 md:h-28 rounded-xl font-mono text-4xl md:text-5xl font-bold
        flex items-center justify-center transition-all duration-200
        ${!value && !disabled ? 'cursor-pointer hover:bg-[hsl(var(--cell-hover))]' : 'cursor-default'}
        ${isWinning ? 'animate-pulse-win bg-[hsl(var(--win-glow)/0.1)]' : 'bg-[hsl(var(--cell-bg))]'}
      `}
      style={{ boxShadow: 'var(--shadow-cell)' }}
      aria-label={`Cell ${value || 'empty'}`}>

      {value &&
      <span
        className={`${isNew ? 'animate-cell-pop' : ''} ${
        value === 'X' ? 'text-[hsl(var(--x-color))]' : 'text-secondary'}`
        }>

          {value}
        </span>
      }
    </button>);

}