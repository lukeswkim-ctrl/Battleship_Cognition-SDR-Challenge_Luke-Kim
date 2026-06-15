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
