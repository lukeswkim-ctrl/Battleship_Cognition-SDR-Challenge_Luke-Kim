import { Difficulty, GameState } from './types';

export type Orientation = 'horizontal' | 'vertical';

function shipCells(startIndex: number, length: number, orientation: Orientation): number[] {
  const step = orientation === 'horizontal' ? 1 : 10;
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
  if (startIndex < 0 || startIndex > 99) return false;

  if (orientation === 'horizontal') {
    if (startIndex + length - 1 > 99) return false;
    const startRow = Math.floor(startIndex / 10);
    const endRow = Math.floor((startIndex + length - 1) / 10);
    if (startRow !== endRow) return false;
  } else {
    if (startIndex + (length - 1) * 10 > 99) return false;
  }

  for (const cell of shipCells(startIndex, length, orientation)) {
    if (occupied.has(cell)) return false;

    if (orientation === 'horizontal') {
      const cellRow = Math.floor(cell / 10);
      const left = cell - 1;
      const right = cell + 1;
      if (Math.floor(left / 10) === cellRow && occupied.has(left)) return false;
      if (Math.floor(right / 10) === cellRow && occupied.has(right)) return false;
    } else {
      const up = cell - 10;
      const down = cell + 10;
      if (up >= 0 && occupied.has(up)) return false;
      if (down <= 99 && occupied.has(down)) return false;
    }
  }

  return true;
}

export function placeShip(length: number, occupied: Set<number>): Set<number> {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const startIndex = Math.floor(Math.random() * 100);
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
  return ships.every((ship) =>
    Array.from(ship).every((cell) => attacks.has(cell))
  );
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

const SHIP_LENGTHS = [5, 4, 3, 3, 2];

function isCellIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 99;
}

function parseCellSet(value: unknown): Set<number> | null {
  if (!Array.isArray(value) || !value.every(isCellIndex)) return null;
  return new Set<number>(value);
}

function parseFleet(value: unknown): Set<number>[] | null {
  if (!Array.isArray(value) || value.length !== SHIP_LENGTHS.length) return null;
  const fleet: Set<number>[] = [];
  for (let i = 0; i < value.length; i++) {
    const ship = parseCellSet(value[i]);
    if (ship === null || ship.size !== SHIP_LENGTHS[i]) return null;
    fleet.push(ship);
  }
  return fleet;
}

export function deserializeGameState(json: string): GameState | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;

  const raw = data as Record<string, unknown>;
  if (raw.phase !== 'playing' && raw.phase !== 'ended') return null;
  if (raw.currentTurn !== 'player' && raw.currentTurn !== 'ai') return null;
  if (raw.difficulty !== 'easy' && raw.difficulty !== 'normal' && raw.difficulty !== 'hard') {
    return null;
  }
  if (raw.winner !== null && raw.winner !== 'player' && raw.winner !== 'ai') return null;
  if (typeof raw.message !== 'string') return null;

  const playerShips = parseFleet(raw.playerShips);
  const aiShips = parseFleet(raw.aiShips);
  const playerAttacks = parseCellSet(raw.playerAttacks);
  const aiAttacks = parseCellSet(raw.aiAttacks);
  if (!playerShips || !aiShips || !playerAttacks || !aiAttacks) return null;

  return {
    phase: raw.phase,
    currentTurn: raw.currentTurn,
    difficulty: raw.difficulty,
    winner: raw.winner,
    message: raw.message.slice(0, 200),
    playerShips,
    aiShips,
    playerAttacks,
    aiAttacks,
  };
}

export function loadGameState(): GameState | null {
  try {
    const json = localStorage.getItem(GAME_STATE_KEY);
    if (!json) return null;
    return deserializeGameState(json);
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, serializeGameState(state));
  } catch { /* full storage or private browsing */ }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch { /* ignore */ }
}
