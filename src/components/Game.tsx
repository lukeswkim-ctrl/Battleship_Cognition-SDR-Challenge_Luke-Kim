import { useEffect, useState } from 'react';
import { Board } from './Board';
import { initializeGame, isAllShipsSunk } from '../lib/game';
import { getAIMove } from '../lib/ai';
import { GameState } from '../lib/types';

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
      <button
        type="button"
        onClick={handleNewGame}
        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 mb-8"
      >
        New Game
      </button>
      <p className="text-slate-300 text-sm mb-8">
        Shots: {shots} | Hits: {hits} | Accuracy: {accuracy}%
      </p>
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
    </div>
  );
}
