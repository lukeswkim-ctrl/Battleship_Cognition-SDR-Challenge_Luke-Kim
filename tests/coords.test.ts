import { describe, it, expect } from 'vitest';
import { COLUMN_LABELS, ROW_LABELS, indexToCoord } from '../src/lib/coords';

describe('coords labels', () => {
  it('has 10 column labels A-J', () => {
    expect(COLUMN_LABELS).toHaveLength(10);
    expect(COLUMN_LABELS[0]).toBe('A');
    expect(COLUMN_LABELS[9]).toBe('J');
  });

  it('has 10 row labels 1-10', () => {
    expect(ROW_LABELS).toHaveLength(10);
    expect(ROW_LABELS[0]).toBe('1');
    expect(ROW_LABELS[9]).toBe('10');
  });
});

describe('indexToCoord', () => {
  it('index 0 → A1 (top-left corner)', () => {
    expect(indexToCoord(0)).toBe('A1');
  });

  it('index 9 → J1 (top-right corner)', () => {
    expect(indexToCoord(9)).toBe('J1');
  });

  it('index 90 → A10 (bottom-left corner)', () => {
    expect(indexToCoord(90)).toBe('A10');
  });

  it('index 99 → J10 (bottom-right corner)', () => {
    expect(indexToCoord(99)).toBe('J10');
  });

  it('index 10 → A2 (start of second row)', () => {
    expect(indexToCoord(10)).toBe('A2');
  });

  it('index 45 → F5 (mid-board)', () => {
    expect(indexToCoord(45)).toBe('F5');
  });

  it('maps every index 0-99 to a label within the grid vocabulary', () => {
    for (let index = 0; index < 100; index++) {
      const coord = indexToCoord(index);
      const col = coord.charAt(0);
      const row = coord.slice(1);
      expect(COLUMN_LABELS).toContain(col);
      expect(ROW_LABELS).toContain(row);
    }
  });

  it('produces a unique coordinate for each index', () => {
    const seen = new Set<string>();
    for (let index = 0; index < 100; index++) {
      seen.add(indexToCoord(index));
    }
    expect(seen.size).toBe(100);
  });
});
