import { Difficulty } from './types';

function getUnattacked(previousAttacks: Set<number>): number[] {
  const available: number[] = [];
  for (let index = 0; index < 100; index++) {
    if (!previousAttacks.has(index)) {
      available.push(index);
    }
  }
  return available;
}

function adjacentCells(cell: number): number[] {
  const row = Math.floor(cell / 10);
  const neighbors: number[] = [];
  const up = cell - 10;
  const down = cell + 10;
  const left = cell - 1;
  const right = cell + 1;
  if (up >= 0) neighbors.push(up);
  if (down <= 99) neighbors.push(down);
  if (left >= 0 && Math.floor(left / 10) === row) neighbors.push(left);
  if (right <= 99 && Math.floor(right / 10) === row) neighbors.push(right);
  return neighbors;
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

  // Confirmed hits: attacked cells that belong to a player ship.
  const confirmedHits = Array.from(previousAttacks).filter((cell) =>
    playerShips.some((ship) => ship.has(cell))
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
      const sameRow = shipHits.every(
        (c) => Math.floor(c / 10) === Math.floor(min / 10)
      );
      const step = sameRow ? 1 : 10;
      const before = min - step;
      const after = max + step;

      const collinear: number[] = [];
      if (sameRow) {
        if (before >= 0 && Math.floor(before / 10) === Math.floor(min / 10)) {
          collinear.push(before);
        }
        if (after <= 99 && Math.floor(after / 10) === Math.floor(max / 10)) {
          collinear.push(after);
        }
      } else {
        if (before >= 0) collinear.push(before);
        if (after <= 99) collinear.push(after);
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
