import { describe, it, expect } from 'vitest';
import {
  isValidPlacement,
  placeShip,
  placeAllShips,
  isAllShipsSunk,
  initializeGame,
} from '../src/lib/game';
import { getAIMove } from '../src/lib/ai';

describe('isValidPlacement', () => {
  it('length 5, start 0, empty → true', () => {
    expect(isValidPlacement(0, 5, new Set())).toBe(true);
  });

  it('length 5, start 6, empty → false (wraps row)', () => {
    expect(isValidPlacement(6, 5, new Set())).toBe(false);
  });

  it('length 5, start 96, empty → false (out of bounds)', () => {
    expect(isValidPlacement(96, 5, new Set())).toBe(false);
  });

  it('length 3, start 10, occupied [11] → false (overlap)', () => {
    expect(isValidPlacement(10, 3, new Set([11]))).toBe(false);
  });

  it('length 3, start 10, occupied [14] → true (no overlap, not adjacent)', () => {
    expect(isValidPlacement(10, 3, new Set([14]))).toBe(true);
  });

  it('length 3, start 10, occupied [13] → false (right-adjacent)', () => {
    expect(isValidPlacement(10, 3, new Set([13]))).toBe(false);
  });

  it('length 3, start 11, occupied [10] → false (left-adjacent)', () => {
    expect(isValidPlacement(11, 3, new Set([10]))).toBe(false);
  });

  it('length 3, start 10, occupied [1, 21] → true (vertical adjacency allowed)', () => {
    expect(isValidPlacement(10, 3, new Set([1, 21]))).toBe(true);
  });

  it('length 2, start 9, empty → false (wraps row)', () => {
    expect(isValidPlacement(9, 2, new Set())).toBe(false);
  });

  it('length 1, start 99, empty → true (edge case)', () => {
    expect(isValidPlacement(99, 1, new Set())).toBe(true);
  });

  it('length 10, start 0, empty → true (full row)', () => {
    expect(isValidPlacement(0, 10, new Set())).toBe(true);
  });

  it('length 10, start 1, empty → false (wraps)', () => {
    expect(isValidPlacement(1, 10, new Set())).toBe(false);
  });
});

describe('placeShip', () => {
  it('Returns Set of correct size', () => {
    const ship = placeShip(4, new Set());
    expect(ship.size).toBe(4);
  });

  it('All indices valid (0-99)', () => {
    const ship = placeShip(5, new Set());
    for (const cell of ship) {
      expect(cell).toBeGreaterThanOrEqual(0);
      expect(cell).toBeLessThanOrEqual(99);
    }
  });

  it('Indices are consecutive', () => {
    const ship = placeShip(5, new Set());
    const sorted = Array.from(ship).sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i] - sorted[i - 1]).toBe(1);
    }
  });

  it('Does not overlap with occupied cells', () => {
    const occupied = new Set([0, 1, 2, 3, 4]);
    const ship = placeShip(3, occupied);
    for (const cell of ship) {
      expect(occupied.has(cell)).toBe(false);
    }
  });
});

describe('placeAllShips', () => {
  it('Returns 5 ships totaling 17 cells', () => {
    const fleet = placeAllShips();
    expect(fleet).toHaveLength(5);
    expect(fleet.reduce((sum, ship) => sum + ship.size, 0)).toBe(17);
  });

  it('All indices valid (0-99)', () => {
    const fleet = placeAllShips();
    for (const ship of fleet) {
      for (const cell of ship) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThanOrEqual(99);
      }
    }
  });

  it('Succeeds on 20 consecutive runs', () => {
    for (let i = 0; i < 20; i++) {
      const fleet = placeAllShips();
      expect(fleet).toHaveLength(5);
      expect(fleet.reduce((sum, ship) => sum + ship.size, 0)).toBe(17);
    }
  });
});

describe('isAllShipsSunk', () => {
  it('attacks [1,2,3], ships [[1,2,3]] → true', () => {
    expect(isAllShipsSunk(new Set([1, 2, 3]), [new Set([1, 2, 3])])).toBe(true);
  });

  it('attacks [1,2], ships [[1,2,3]] → false', () => {
    expect(isAllShipsSunk(new Set([1, 2]), [new Set([1, 2, 3])])).toBe(false);
  });

  it('attacks [1,2,3,4,5], ships [[1,2,3]] → true', () => {
    expect(isAllShipsSunk(new Set([1, 2, 3, 4, 5]), [new Set([1, 2, 3])])).toBe(true);
  });

  it('attacks [], ships [[1,2,3]] → false', () => {
    expect(isAllShipsSunk(new Set(), [new Set([1, 2, 3])])).toBe(false);
  });

  it('attacks [4,5,6], ships [[1,2,3]] → false', () => {
    expect(isAllShipsSunk(new Set([4, 5, 6]), [new Set([1, 2, 3])])).toBe(false);
  });

  it('multi-ship: false when only some ships fully hit', () => {
    const ships = [new Set([1, 2]), new Set([5, 6, 7])];
    expect(isAllShipsSunk(new Set([1, 2]), ships)).toBe(false);
  });

  it('multi-ship: true when all ships fully hit', () => {
    const ships = [new Set([1, 2]), new Set([5, 6, 7])];
    expect(isAllShipsSunk(new Set([1, 2, 5, 6, 7]), ships)).toBe(true);
  });
});

describe('getAIMove', () => {
  it('Returns valid index (0-99)', () => {
    const move = getAIMove(new Set());
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(99);
  });

  it('Never returns attacked cell', () => {
    const attacks = new Set([0, 1, 2, 3, 4, 5]);
    for (let i = 0; i < 50; i++) {
      expect(attacks.has(getAIMove(attacks))).toBe(false);
    }
  });

  it('Throws error when no moves available', () => {
    const allAttacked = new Set(Array.from({ length: 100 }, (_, i) => i));
    expect(() => getAIMove(allAttacked)).toThrow();
  });

  it('Works with 99 cells attacked (1 remaining)', () => {
    const attacks = new Set(Array.from({ length: 99 }, (_, i) => i));
    expect(getAIMove(attacks)).toBe(99);
  });

  it('Hunt/target: targets a cell adjacent to a confirmed hit', () => {
    const playerShips = [new Set([45, 46])];
    const previousAttacks = new Set([45]);
    const adjacent = new Set([35, 55, 44, 46]);
    for (let i = 0; i < 50; i++) {
      const move = getAIMove(previousAttacks, playerShips, 'normal');
      expect(adjacent.has(move)).toBe(true);
    }
  });

  it('Hunt/target: falls back to random when no adjacent cells remain', () => {
    const playerShips = [new Set([45])];
    const previousAttacks = new Set([35, 44, 45, 46, 55]);
    for (let i = 0; i < 20; i++) {
      const move = getAIMove(previousAttacks, playerShips, 'normal');
      expect(previousAttacks.has(move)).toBe(false);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThanOrEqual(99);
    }
  });

  it('Hard: continues collinear with existing hits on a ship', () => {
    const playerShips = [new Set([45, 46, 47])];
    const previousAttacks = new Set([45, 46]);
    const collinear = new Set([44, 47]);
    for (let i = 0; i < 50; i++) {
      const move = getAIMove(previousAttacks, playerShips, 'hard');
      expect(collinear.has(move)).toBe(true);
    }
  });

  it('Easy: ignores hunt/target (can pick non-adjacent cells)', () => {
    const playerShips = [new Set([45, 46])];
    const previousAttacks = new Set([45]);
    const adjacent = new Set([35, 55, 44, 46]);
    let sawNonAdjacent = false;
    for (let i = 0; i < 100; i++) {
      const move = getAIMove(previousAttacks, playerShips, 'easy');
      if (!adjacent.has(move)) sawNonAdjacent = true;
    }
    expect(sawNonAdjacent).toBe(true);
  });
});

describe('initializeGame', () => {
  it('Returns correct initial values', () => {
    const game = initializeGame();
    expect(game.winner).toBe(null);
    expect(game.playerAttacks.size).toBe(0);
    expect(game.aiAttacks.size).toBe(0);
    expect(game.message).toBe('Your turn. Click enemy waters to attack.');
  });

  it('playerShips has 5 ships totaling 17 cells', () => {
    const fleet = initializeGame().playerShips;
    expect(fleet).toHaveLength(5);
    expect(fleet.reduce((sum, ship) => sum + ship.size, 0)).toBe(17);
  });

  it('aiShips has 5 ships totaling 17 cells', () => {
    const fleet = initializeGame().aiShips;
    expect(fleet).toHaveLength(5);
    expect(fleet.reduce((sum, ship) => sum + ship.size, 0)).toBe(17);
  });

  it("phase === 'playing'", () => {
    expect(initializeGame().phase).toBe('playing');
  });

  it("currentTurn === 'player'", () => {
    expect(initializeGame().currentTurn).toBe('player');
  });

  it('defaults difficulty to normal', () => {
    expect(initializeGame().difficulty).toBe('normal');
  });

  it('accepts a difficulty argument', () => {
    expect(initializeGame('hard').difficulty).toBe('hard');
  });
});
