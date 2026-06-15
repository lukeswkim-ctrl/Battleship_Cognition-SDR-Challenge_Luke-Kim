import { useEffect, useRef } from 'react';
import { MiniBoard } from './MiniBoard';
import { Difficulty, GameState } from '../lib/types';
import { LifetimeStats } from '../lib/storage';

interface EndGameModalProps {
  game: GameState;
  difficulty: Difficulty;
  lifetimeStats: LifetimeStats;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
}

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

export function EndGameModal({
  game,
  difficulty,
  lifetimeStats,
  onPlayAgain,
  onChangeDifficulty,
}: EndGameModalProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  const won = game.winner === 'player';
  const shots = game.playerAttacks.size;
  const hits = Array.from(game.playerAttacks).filter((idx) =>
    game.aiShips.some((ship) => ship.has(idx))
  ).length;
  const accuracy = shots === 0 ? 0 : (hits / shots) * 100;
  const totalTurns = game.playerAttacks.size + game.aiAttacks.size;

  const enemySunk = game.aiShips.filter((ship) =>
    Array.from(ship).every((cell) => game.playerAttacks.has(cell))
  ).length;
  const playerLost = game.playerShips.filter((ship) =>
    Array.from(ship).every((cell) => game.aiAttacks.has(cell))
  ).length;

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPlayAgain]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
      >
        <h2
          className={`text-3xl sm:text-4xl font-black text-center mb-1 ${
            won ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {won ? 'VICTORY' : 'DEFEAT'}
        </h2>
        <p className="text-center text-slate-400 text-sm mb-4">
          {DIFF_LABELS[difficulty]} · {totalTurns} turns
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400 text-xs">Your Accuracy</div>
            <div className="text-slate-100 font-bold text-lg">{accuracy.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400 text-xs">Enemy Ships Sunk</div>
            <div className="text-slate-100 font-bold text-lg">{enemySunk} / 5</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400 text-xs">Your Ships Lost</div>
            <div className="text-slate-100 font-bold text-lg">{playerLost} / 5</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400 text-xs">Win Streak</div>
            <div className="text-slate-100 font-bold text-lg">{lifetimeStats.currentStreak}</div>
          </div>
        </div>

        <div className="hidden sm:flex justify-center gap-4 mb-5">
          <MiniBoard
            title="Your Fleet"
            ships={game.playerShips}
            attacks={game.aiAttacks}
            showShips={true}
          />
          <MiniBoard
            title="Enemy Waters"
            ships={game.aiShips}
            attacks={game.playerAttacks}
            showShips={true}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            ref={primaryRef}
            type="button"
            onClick={onPlayAgain}
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onChangeDifficulty}
            className="px-6 py-2.5 bg-slate-700 text-slate-300 font-semibold rounded hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Change Difficulty
          </button>
        </div>
      </div>
    </div>
  );
}
