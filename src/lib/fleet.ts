import { CellState } from './types';

export const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];

export function isShipSunk(ship: Set<number>, attacks: Set<number>): boolean {
  return Array.from(ship).every((cell) => attacks.has(cell));
}

export function sunkShipCells(fleet: Set<number>[], attacks: Set<number>): Set<number> {
  const cells = new Set<number>();
  for (const ship of fleet) {
    if (isShipSunk(ship, attacks)) {
      for (const cell of ship) cells.add(cell);
    }
  }
  return cells;
}

export function countSunkShips(fleet: Set<number>[], attacks: Set<number>): number {
  return fleet.filter((ship) => isShipSunk(ship, attacks)).length;
}

export function shipsRemaining(fleet: Set<number>[], attacks: Set<number>): number {
  return fleet.length - countSunkShips(fleet, attacks);
}

export function isHitOn(fleet: Set<number>[], index: number): boolean {
  return fleet.some((ship) => ship.has(index));
}

export function countHits(fleet: Set<number>[], attacks: Set<number>): number {
  return Array.from(attacks).filter((index) => isHitOn(fleet, index)).length;
}

export function accuracyPercent(hits: number, shots: number): number {
  return shots === 0 ? 0 : (hits / shots) * 100;
}

export function formatAccuracy(hits: number, shots: number): string {
  return accuracyPercent(hits, shots).toFixed(1);
}

export function cellStateAt(
  index: number,
  fleet: Set<number>[],
  attacks: Set<number>,
  showShips: boolean
): CellState {
  const isAttacked = attacks.has(index);
  const isShip = isHitOn(fleet, index);
  if (isAttacked && isShip) return 'hit';
  if (isAttacked) return 'miss';
  if (showShips && isShip) return 'ship';
  return 'empty';
}
