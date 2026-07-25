import { Difficulty } from './types';
import { BOARD_SIZE, CELL_COUNT, adjacentCells, inBounds, sameRow } from './coords';
import { isShipSunk } from './fleet';

function getUnattacked(previousAttacks: Set<number>): number[] {
  const available: number[] = [];
  for (let index = 0; index < CELL_COUNT; index++) {
    if (!previousAttacks.has(index)) {
      available.push(index);
    }
  }
  return available;
}

function pickRandom(cells: number[]): number {
  return cells[Math.floor(Math.random() * cells.length)];
}

export function getAIMove(
  previousAttacks: Set<number>,
  playerShips: Set<number>[] = [],
  difficulty: Difficulty = 'normal'
): number {
  const available = getUnattacked(previousAttacks);
  if (available.length === 0) {
    throw new Error('No moves available');
  }

  // Easy: always fully random.
  if (difficulty === 'easy') {
    return pickRandom(available);
  }

  // Confirmed hits: attacked cells that belong to a player ship (exclude fully-sunk ships).
  const confirmedHits = Array.from(previousAttacks).filter((cell) =>
    playerShips.some((ship) => ship.has(cell) && !isShipSunk(ship, previousAttacks))
  );

  if (confirmedHits.length === 0) {
    return pickRandom(available);
  }

  // Hard: prefer continuing in line with an already partially-hit ship.
  if (difficulty === 'hard') {
    for (const hitCell of confirmedHits) {
      const ship = playerShips.find((s) => s.has(hitCell));
      if (!ship) continue;

      const shipHits = Array.from(ship)
        .filter((cell) => previousAttacks.has(cell))
        .sort((a, b) => a - b);
      if (shipHits.length < 2) continue;

      const min = shipHits[0];
      const max = shipHits[shipHits.length - 1];
      const isHorizontal = shipHits.every((c) => sameRow(c, min));
      const step = isHorizontal ? 1 : BOARD_SIZE;
      const before = min - step;
      const after = max + step;

      const collinear: number[] = [];
      if (isHorizontal) {
        if (inBounds(before) && sameRow(before, min)) collinear.push(before);
        if (inBounds(after) && sameRow(after, max)) collinear.push(after);
      } else {
        if (inBounds(before)) collinear.push(before);
        if (inBounds(after)) collinear.push(after);
      }

      const collinearTargets = collinear.filter((c) => !previousAttacks.has(c));
      if (collinearTargets.length > 0) {
        return pickRandom(collinearTargets);
      }
    }
  }

  // Normal (and hard fallback): target any unattacked neighbor of a hit.
  const targets: number[] = [];
  for (const hitCell of confirmedHits) {
    for (const neighbor of adjacentCells(hitCell)) {
      if (!previousAttacks.has(neighbor)) {
        targets.push(neighbor);
      }
    }
  }

  if (targets.length > 0) {
    return pickRandom(targets);
  }

  return pickRandom(available);
}
