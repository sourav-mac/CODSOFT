/**
 * Tic-Tac-Toe AI using Minimax with Alpha-Beta Pruning
 *
 * HOW MINIMAX WORKS:
 * -----------------
 * Minimax is a recursive algorithm used in two-player games.
 * It explores ALL possible future game states (like a tree).
 *
 * - The AI (maximizer) tries to MAXIMIZE its score.
 * - The human (minimizer) tries to MINIMIZE the AI's score.
 *
 * Scores: AI wins = +10, Human wins = -10, Draw = 0.
 * The depth is subtracted so the AI prefers faster wins.
 *
 * ALPHA-BETA PRUNING:
 * ------------------
 * An optimization that skips branches that can't possibly
 * affect the final decision, making the search faster.
 * - Alpha: best score the maximizer can guarantee
 * - Beta: best score the minimizer can guarantee
 * - If beta <= alpha, we prune (skip) the remaining branches.
 */

export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[];

// Winning line indices
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

/** Check if a player has won. Returns the winning line or null. */
export function checkWinner(board: Board): { winner: CellValue; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

/** Check if the board is full (draw). */
export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}

/** Get all empty cell indices. */
function getEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);
}

/**
 * Minimax with Alpha-Beta Pruning.
 * @param board - current board state
 * @param depth - current depth in the game tree
 * @param isMaximizing - true if it's the AI's turn (O)
 * @param alpha - best value the maximizer can guarantee
 * @param beta - best value the minimizer can guarantee
 * @returns the evaluation score of the board
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const { winner } = checkWinner(board);

  // Base cases: terminal states
  if (winner === 'O') return 10 - depth;  // AI wins (prefer faster wins)
  if (winner === 'X') return depth - 10;  // Human wins
  if (isBoardFull(board)) return 0;        // Draw

  if (isMaximizing) {
    // AI's turn: maximize score
    let maxEval = -Infinity;
    for (const i of getEmptyCells(board)) {
      board[i] = 'O';
      const eval_ = minimax(board, depth + 1, false, alpha, beta);
      board[i] = null; // undo move
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-Beta prune
    }
    return maxEval;
  } else {
    // Human's turn: minimize score
    let minEval = Infinity;
    for (const i of getEmptyCells(board)) {
      board[i] = 'X';
      const eval_ = minimax(board, depth + 1, true, alpha, beta);
      board[i] = null; // undo move
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-Beta prune
    }
    return minEval;
  }
}

/**
 * Find the best move for the AI.
 * @param board - current board state
 * @param aiPlayer - which symbol the AI plays ('X' or 'O')
 */
export function findBestMove(board: Board, aiPlayer: CellValue = 'O'): number {
  const humanPlayer = aiPlayer === 'O' ? 'X' : 'O';
  let bestScore = -Infinity;
  let bestMove = -1;

  for (const i of getEmptyCells(board)) {
    board[i] = aiPlayer;
    const score = minimaxGeneral(board, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

/**
 * Find a random empty cell (used for easy/medium difficulty).
 */
export function findRandomMove(board: Board): number {
  const empty = getEmptyCells(board);
  return empty.length > 0 ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

/**
 * Generalized minimax that works regardless of which side the AI plays.
 */
function minimaxGeneral(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: CellValue,
  humanPlayer: CellValue
): number {
  const { winner } = checkWinner(board);

  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const i of getEmptyCells(board)) {
      board[i] = aiPlayer;
      const eval_ = minimaxGeneral(board, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
      board[i] = null;
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const i of getEmptyCells(board)) {
      board[i] = humanPlayer;
      const eval_ = minimaxGeneral(board, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
      board[i] = null;
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
