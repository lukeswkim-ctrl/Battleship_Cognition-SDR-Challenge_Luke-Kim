import { useEffect, useState } from 'react';
import { Board } from './Board';
import { initializeGame, isAllShipsSunk } from '../lib/game';
import { getAIMove } from '../lib/ai';
import { GameState } from '../lib/types';

const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];

function FleetStatus({
  title,
  fleet,
  attacks,
}: {
  title: string;
  fleet: number[][];
  attacks: Set<number>;
}) {
  return (
    <div className="w-36 bg-slate-900 rounded p-3">
      <h3 className="font-bold text-slate-100 mb-2">{title}</h3>
      <ul className="space-y-1 text-sm">
        {fleet.map((segment, i) => {
          const sunk = segment.every((cell) => attacks.has(cell));
          return (
            <li key={i} className="flex justify-between">
              <span className="text-slate-300">{SHIP_NAMES[i]}</span>
              <span className={sunk ? 'text-red-500 font-semibold' : 'text-emerald-500'}>
                {sunk ? 'Sunk' : 'Afloat'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const LEGEND = [
  { color: 'bg-blue-900', label: 'Empty' },
  { color: 'bg-gray-400', label: 'Your Ship' },
  { color: 'bg-red-500', label: 'Hit' },
  { color: 'bg-blue-300', label: 'Miss' },
];

export function Game() {
  const [game, setGame] = useState<GameState>(() => initializeGame());

  const handlePlayerAttack = (index: number) => {
    if (game.phase !== 'playing') return;
    if (game.currentTurn !== 'player') return;
    if (game.playerAttacks.has(index)) return;

    const newAttacks = new Set(game.playerAttacks);
    newAttacks.add(index);
    const isHit = game.aiShips.has(index);

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
      const aiMove = getAIMove(game.aiAttacks);
      const newAttacks = new Set(game.aiAttacks);
      newAttacks.add(aiMove);
      const isHit = game.playerShips.has(aiMove);

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
    setGame(initializeGame());
  };

  useEffect(() => {
    if (game.currentTurn === 'ai' && game.phase === 'playing') {
      const timer = setTimeout(() => {
        handleAIAttack();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game.currentTurn, game.phase]);

  const shots = game.playerAttacks.size;
  const hits = Array.from(game.playerAttacks).filter((index) =>
    game.aiShips.has(index)
  ).length;
  const accuracy = shots === 0 ? '0' : ((hits / shots) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-slate-100 mb-2">BATTLESHIP — Human vs AI</h1>
      <p className="text-base text-slate-400 mb-4">Sink all 5 enemy ships to win.</p>
      <p className="text-lg text-slate-300 mb-4">{game.message}</p>
      <p className="text-slate-300 text-sm mb-8">
        Shots: {shots} | Hits: {hits} | Accuracy: {accuracy}%
      </p>
      <div className="flex flex-row items-start gap-6">
        <FleetStatus title="Your Fleet" fleet={game.playerFleet} attacks={game.aiAttacks} />
        <div className="flex gap-8">
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
        <FleetStatus title="Enemy Fleet" fleet={game.aiFleet} attacks={game.playerAttacks} />
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
