import { Difficulty, GameState } from './types';

export function isValidPlacement(
  startIndex: number,
  length: number,
  occupied: Set<number>
): boolean {
  if (startIndex < 0 || startIndex > 99) return false;
  if (startIndex + length - 1 > 99) return false;

  const startRow = Math.floor(startIndex / 10);
  const endRow = Math.floor((startIndex + length - 1) / 10);
  if (startRow !== endRow) return false;

  for (let i = 0; i < length; i++) {
    const cell = startIndex + i;
    if (occupied.has(cell)) return false;

    const cellRow = Math.floor(cell / 10);
    const left = cell - 1;
    const right = cell + 1;
    if (Math.floor(left / 10) === cellRow && occupied.has(left)) return false;
    if (Math.floor(right / 10) === cellRow && occupied.has(right)) return false;
  }

  return true;
}

export function placeShip(length: number, occupied: Set<number>): Set<number> {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const startIndex = Math.floor(Math.random() * 100);
    if (isValidPlacement(startIndex, length, occupied)) {
      const ship = new Set<number>();
      for (let i = 0; i < length; i++) {
        ship.add(startIndex + i);
      }
      return ship;
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
