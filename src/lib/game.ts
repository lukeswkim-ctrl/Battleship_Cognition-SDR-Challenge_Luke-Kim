import { Difficulty, GameState } from './types';
import { BOARD_SIZE, CELL_COUNT, inBounds, rowOf, sameRow } from './coords';
import { isShipSunk } from './fleet';
import { readItem, removeItem, writeItem } from './persist';

export type Orientation = 'horizontal' | 'vertical';

function shipCells(startIndex: number, length: number, orientation: Orientation): number[] {
  const step = orientation === 'horizontal' ? 1 : BOARD_SIZE;
  const cells: number[] = [];
  for (let i = 0; i < length; i++) {
    cells.push(startIndex + i * step);
  }
  return cells;
}

export function isValidPlacement(
  startIndex: number,
  length: number,
  occupied: Set<number>,
  orientation: Orientation = 'horizontal'
): boolean {
  if (!inBounds(startIndex)) return false;

  const endIndex =
    orientation === 'horizontal' ? startIndex + length - 1 : startIndex + (length - 1) * BOARD_SIZE;
  if (!inBounds(endIndex)) return false;
  if (orientation === 'horizontal' && rowOf(startIndex) !== rowOf(endIndex)) return false;

  for (const cell of shipCells(startIndex, length, orientation)) {
    if (occupied.has(cell)) return false;

    if (orientation === 'horizontal') {
      const left = cell - 1;
      const right = cell + 1;
      if (sameRow(left, cell) && occupied.has(left)) return false;
      if (sameRow(right, cell) && occupied.has(right)) return false;
    } else {
      const up = cell - BOARD_SIZE;
      const down = cell + BOARD_SIZE;
      if (inBounds(up) && occupied.has(up)) return false;
      if (inBounds(down) && occupied.has(down)) return false;
    }
  }

  return true;
}

export function placeShip(length: number, occupied: Set<number>): Set<number> {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const startIndex = Math.floor(Math.random() * CELL_COUNT);
    if (isValidPlacement(startIndex, length, occupied, orientation)) {
      return new Set<number>(shipCells(startIndex, length, orientation));
    }
  }
  throw new Error(`Failed to place ship of length ${length} after 1000 attempts`);
}

export function placeAllShips(): Set<number>[] {
  const lengths = [5, 4, 3, 3, 2];
  const occupied = new Set<number>();
  const fleet: Set<number>[] = [];

  for (const length of lengths) {
    const ship = placeShip(length, occupied);
    for (const cell of ship) {
      occupied.add(cell);
    }
    fleet.push(ship);
  }

  return fleet;
}

export function isAllShipsSunk(
  attacks: Set<number>,
  ships: Set<number>[]
): boolean {
  return ships.every((ship) => isShipSunk(ship, attacks));
}

export function initializeGame(difficulty: Difficulty = 'normal'): GameState {
  return {
    phase: 'playing',
    currentTurn: 'player',
    difficulty,
    playerShips: placeAllShips(),
    aiShips: placeAllShips(),
    playerAttacks: new Set<number>(),
    aiAttacks: new Set<number>(),
    winner: null,
    message: 'Your turn. Click enemy waters to attack.',
  };
}

const GAME_STATE_KEY = 'battleship-game-state';

export function serializeGameState(state: GameState): string {
  return JSON.stringify({
    ...state,
    playerShips: state.playerShips.map((s) => Array.from(s)),
    aiShips: state.aiShips.map((s) => Array.from(s)),
    playerAttacks: Array.from(state.playerAttacks),
    aiAttacks: Array.from(state.aiAttacks),
  });
}

export function deserializeGameState(json: string): GameState | null {
  try {
    const data = JSON.parse(json);
    return {
      ...data,
      playerShips: data.playerShips.map((arr: number[]) => new Set(arr)),
      aiShips: data.aiShips.map((arr: number[]) => new Set(arr)),
      playerAttacks: new Set(data.playerAttacks),
      aiAttacks: new Set(data.aiAttacks),
    };
  } catch {
    return null;
  }
}

export function loadGameState(): GameState | null {
  const json = readItem(GAME_STATE_KEY);
  if (!json) return null;
  return deserializeGameState(json);
}

export function saveGameState(state: GameState): void {
  writeItem(GAME_STATE_KEY, serializeGameState(state));
}

export function clearGameState(): void {
  removeItem(GAME_STATE_KEY);
}
