import { useEffect, useState } from 'react';
import { Board } from './Board';
import { initializeGame, isAllShipsSunk } from '../lib/game';
import { getAIMove } from '../lib/ai';
import { Difficulty, GameState } from '../lib/types';

const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' },
];

function FleetStatus({
  title,
  fleet,
  attacks,
}: {
  title: string;
  fleet: Set<number>[];
  attacks: Set<number>;
}) {
  return (
    <div className="w-40 sm:w-48 bg-slate-900 rounded p-3">
      <h3 className="font-bold text-slate-100 mb-2">{title}</h3>
      <ul className="space-y-2 text-sm">
        {fleet.map((ship, i) => {
          const size = ship.size;
          const hits = Array.from(ship).filter((cell) => attacks.has(cell)).length;
          const pct = Math.round((hits / size) * 100);
          const color =
            pct === 100
              ? 'text-red-500 line-through'
              : pct === 0
                ? 'text-emerald-500'
                : 'text-yellow-500';
          const fillColor =
            pct === 100 ? 'bg-red-500' : pct === 0 ? 'bg-emerald-500' : 'bg-yellow-500';
          return (
            <li key={i}>
              <div className={`flex justify-between ${color}`}>
                <span>
                  {SHIP_NAMES[i]} ({size})
                </span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-2 w-full bg-slate-700 rounded-sm overflow-hidden">
                <div className={`h-full ${fillColor}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const LEGEND = [
  { color: 'bg-blue-900', label: 'Empty' },
  { color: 'bg-red-500', label: 'Hit' },
  { color: 'bg-gray-400', label: 'Miss' },
];

export function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<GameState>(() => initializeGame('normal'));

  const handlePlayerAttack = (index: number) => {
    if (game.phase !== 'playing') return;
    if (game.currentTurn !== 'player') return;
    if (game.playerAttacks.has(index)) return;

    const newAttacks = new Set(game.playerAttacks);
    newAttacks.add(index);
    const isHit = game.aiShips.some((ship) => ship.has(index));

    if (isAllShipsSunk(newAttacks, game.aiShips)) {
      setGame({
        ...game,
        playerAttacks: newAttacks,
        phase: 'ended',
        winner: 'player',
        message: 'You win! All enemy ships destroyed.',
      });
      return;
    }

    setGame({
      ...game,
      playerAttacks: newAttacks,
      currentTurn: 'ai',
      message: isHit ? 'Hit!' : 'Miss.',
    });
  };

  const handleAIAttack = () => {
    if (game.phase !== 'playing') return;
    if (game.currentTurn !== 'ai') return;

    try {
      const aiMove = getAIMove(game.aiAttacks, game.playerShips, difficulty);
      const newAttacks = new Set(game.aiAttacks);
      newAttacks.add(aiMove);
      const isHit = game.playerShips.some((ship) => ship.has(aiMove));

      if (isAllShipsSunk(newAttacks, game.playerShips)) {
        setGame({
          ...game,
          aiAttacks: newAttacks,
          phase: 'ended',
          winner: 'ai',
          message: 'AI wins! All your ships destroyed.',
        });
        return;
      }

      setGame({
        ...game,
        aiAttacks: newAttacks,
        currentTurn: 'player',
        message: isHit ? 'AI hit your ship!' : 'AI missed.',
      });
    } catch (error) {
      console.error('AI move failed:', error);
    }
  };

  const handleNewGame = () => {
    setGame(initializeGame(difficulty));
  };

  useEffect(() => {
    if (game.currentTurn === 'ai' && game.phase === 'playing') {
      const timer = setTimeout(() => {
        handleAIAttack();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game.currentTurn, game.phase]);

  const showDifficulty = game.phase === 'ended' || game.playerAttacks.size === 0;

  const shots = game.playerAttacks.size;
  const hits = Array.from(game.playerAttacks).filter((index) =>
    game.aiShips.some((ship) => ship.has(index))
  ).length;
  const accuracy = shots === 0 ? '0' : ((hits / shots) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">BATTLESHIP</h1>
      <p className="text-sm md:text-base text-slate-400 mb-4">Sink all 5 enemy ships to win.</p>
      <p className="text-base md:text-lg text-slate-300 mb-4 text-center">{game.message}</p>
      <p className="text-slate-300 text-xs md:text-sm mb-4 text-center">
        Shots: {shots} | Hits: {hits} | Accuracy: {accuracy}%
      </p>
      {showDifficulty && (
        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
          <span className="text-slate-400 text-xs md:text-sm">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                difficulty === d.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <FleetStatus title="Your Fleet" fleet={game.playerShips} attacks={game.aiAttacks} />
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <Board
            title="Your Fleet"
            ships={game.playerShips}
            attacks={game.aiAttacks}
            showShips={true}
            onCellClick={() => {}}
            disabled={true}
          />
          <Board
            title="Enemy Waters"
            ships={game.aiShips}
            attacks={game.playerAttacks}
            showShips={game.phase === 'ended'}
            onCellClick={handlePlayerAttack}
            disabled={game.currentTurn !== 'player' || game.phase !== 'playing'}
          />
        </div>
        <FleetStatus title="Enemy Fleet" fleet={game.aiShips} attacks={game.playerAttacks} />
      </div>
      <div className="flex flex-row justify-center items-center gap-4 text-slate-400 text-xs mt-6 mb-8">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span className={`w-5 h-5 inline-block rounded-sm ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={handleNewGame}
        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
      >
        New Game
      </button>
    </div>
  );
}
