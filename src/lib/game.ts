import { GameState } from './types';

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
    if (occupied.has(startIndex + i)) return false;
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

export function placeAllShips(): Set<number> {
  const lengths = [5, 4, 3, 3, 2];
  const occupied = new Set<number>();

  for (const length of lengths) {
    const ship = placeShip(length, occupied);
    for (const cell of ship) {
      occupied.add(cell);
    }
  }

  return occupied;
}

export function placeFleet(): number[][] {
  const lengths = [5, 4, 3, 3, 2];
  const occupied = new Set<number>();
  const fleet: number[][] = [];

  for (const length of lengths) {
    const ship = placeShip(length, occupied);
    const cells: number[] = [];
    for (const cell of ship) {
      occupied.add(cell);
      cells.push(cell);
    }
    fleet.push(cells.sort((a, b) => a - b));
  }

  return fleet;
}

export function isAllShipsSunk(attacks: Set<number>, ships: Set<number>): boolean {
  for (const ship of ships) {
    if (!attacks.has(ship)) return false;
  }
  return true;
}

export function initializeGame(): GameState {
  const playerFleet = placeFleet();
  const aiFleet = placeFleet();

  return {
    phase: 'playing',
    currentTurn: 'player',
    playerShips: new Set(playerFleet.flat()),
    aiShips: new Set(aiFleet.flat()),
    playerFleet,
    aiFleet,
    playerAttacks: new Set<number>(),
    aiAttacks: new Set<number>(),
    winner: null,
    message: 'Your turn. Click enemy waters to attack.',
  };
}
