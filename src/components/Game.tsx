import { useEffect, useRef, useState } from 'react';
import { Board, CellFlash } from './Board';
import { initializeGame, isAllShipsSunk } from '../lib/game';
import { getAIMove } from '../lib/ai';
import { Difficulty, GameState, Player } from '../lib/types';
import { indexToCoord } from '../lib/coords';

const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];

type ActionResult = 'hit' | 'miss' | 'sunk';

interface LastAction {
  actor: Player;
  index: number;
  result: ActionResult;
  shipName?: string;
}

function shipsRemaining(fleet: Set<number>[], attacks: Set<number>): number {
  return fleet.filter((ship) => Array.from(ship).some((cell) => !attacks.has(cell))).length;
}

function resolveAttack(
  index: number,
  fleet: Set<number>[],
  attacks: Set<number>
): { result: ActionResult; shipName?: string } {
  const shipIdx = fleet.findIndex((ship) => ship.has(index));
  if (shipIdx === -1) return { result: 'miss' };
  const ship = fleet[shipIdx];
  const sunk = Array.from(ship).every((cell) => attacks.has(cell));
  return sunk ? { result: 'sunk', shipName: SHIP_NAMES[shipIdx] } : { result: 'hit' };
}

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [playerFlash, setPlayerFlash] = useState<CellFlash | null>(null);
  const [aiFlash, setAiFlash] = useState<CellFlash | null>(null);
  const playerFlashTokRef = useRef(0);
  const aiFlashTokRef = useRef(0);

  const flashText = (result: ActionResult): string =>
    result === 'sunk' ? 'SUNK' : result === 'hit' ? 'HIT!' : 'MISS';

  const flashEnemyCell = (index: number, result: ActionResult) => {
    const tok = ++playerFlashTokRef.current;
    setPlayerFlash({ index, text: flashText(result), kind: result });
    setTimeout(() => {
      if (playerFlashTokRef.current === tok) setPlayerFlash(null);
    }, 1000);
  };

  const flashPlayerCell = (index: number, result: ActionResult) => {
    const tok = ++aiFlashTokRef.current;
    setAiFlash({ index, text: flashText(result), kind: result });
    setTimeout(() => {
      if (aiFlashTokRef.current === tok) setAiFlash(null);
    }, 1000);
  };

  const handlePlayerAttack = (index: number) => {
    if (game.phase !== 'playing') return;
    if (game.currentTurn !== 'player') return;
    if (game.playerAttacks.has(index)) return;

    const newAttacks = new Set(game.playerAttacks);
    newAttacks.add(index);
    const isHit = game.aiShips.some((ship) => ship.has(index));
    const { result, shipName } = resolveAttack(index, game.aiShips, newAttacks);
    setLastAction({ actor: 'player', index, result, shipName });
    flashEnemyCell(index, result);

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
      const { result, shipName } = resolveAttack(aiMove, game.playerShips, newAttacks);
      setLastAction({ actor: 'ai', index: aiMove, result, shipName });
      flashPlayerCell(aiMove, result);

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
    setLastAction(null);
    setHoveredIndex(null);
    setPlayerFlash(null);
    setAiFlash(null);
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
    game.aiShips.some((ship) => ship.has(index))
  ).length;
  const accuracy = shots === 0 ? '0' : ((hits / shots) * 100).toFixed(1);
  const canChooseDifficulty = game.phase === 'ended' || game.playerAttacks.size === 0;

  const enemyShipsRemaining = shipsRemaining(game.aiShips, game.playerAttacks);

  const turnLabel =
    game.phase === 'ended'
      ? game.winner === 'player'
        ? '🏆 You Win!'
        : '💥 Enemy Wins'
      : game.currentTurn === 'player'
        ? '🎯 Your Turn'
        : '⏳ Enemy Turn';

  const actionResultLabel = (action: LastAction): string => {
    if (action.result === 'sunk') return `Sunk ${action.shipName}`;
    if (action.result === 'hit') return 'Hit';
    return 'Miss';
  };

  const lastActionText = lastAction
    ? `${lastAction.actor === 'player' ? 'You' : 'Enemy'}: ${actionResultLabel(lastAction)} at ${indexToCoord(lastAction.index)}`
    : 'No actions yet';

  let targetingText: string | null = null;
  let targetingClass = 'text-amber-400';
  if (hoveredIndex !== null && game.currentTurn === 'player' && game.phase === 'playing') {
    const coord = indexToCoord(hoveredIndex);
    if (game.playerAttacks.has(hoveredIndex)) {
      const wasHit = game.aiShips.some((ship) => ship.has(hoveredIndex));
      if (wasHit) {
        targetingText = `Already hit at ${coord}`;
        targetingClass = 'text-emerald-400';
      } else {
        targetingText = `Already missed at ${coord}`;
        targetingClass = 'text-slate-400';
      }
    } else {
      targetingText = `Targeting: ${coord}`;
      targetingClass = 'text-amber-400';
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">BATTLESHIP</h1>
      <p className="text-sm md:text-base text-slate-400 mb-4">Sink all 5 enemy ships to win.</p>
      <p className="text-slate-300 text-xs md:text-sm mb-4 text-center">
        Shots: {shots} | Hits: {hits} | Accuracy: {accuracy}%
      </p>
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base md:text-lg font-bold text-slate-100">{turnLabel}</span>
          <span className="text-xs md:text-sm font-semibold text-slate-300">
            Enemy Ships Remaining: <span className="text-emerald-400">{enemyShipsRemaining}</span>
          </span>
        </div>
        <div className="mt-1 text-xs md:text-sm text-slate-400">Last Action: {lastActionText}</div>
        <div className={`mt-1 text-xs md:text-sm h-4 ${targetingClass}`}>{targetingText}</div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <FleetStatus title="Your Fleet" fleet={game.playerShips} attacks={game.aiAttacks} />
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <Board
            title="Your Fleet"
            ships={game.playerShips}
            attacks={game.aiAttacks}
            showShips={true}
            onCellClick={() => {}}
            disabled={true}
            flash={aiFlash}
          />
          <Board
            title="Enemy Waters"
            ships={game.aiShips}
            attacks={game.playerAttacks}
            showShips={game.phase === 'ended'}
            onCellClick={handlePlayerAttack}
            onCellHover={setHoveredIndex}
            disabled={game.currentTurn !== 'player' || game.phase !== 'playing'}
            flash={playerFlash}
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
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleNewGame}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
        >
          New Game
        </button>
        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="text-slate-400 text-xs md:text-sm">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              disabled={!canChooseDifficulty}
              className={`px-3 py-1 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                difficulty === d.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
