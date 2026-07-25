export const BOARD_SIZE = 10;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export function rowOf(index: number): number {
  return Math.floor(index / BOARD_SIZE);
}

export function colOf(index: number): number {
  return index % BOARD_SIZE;
}

export function inBounds(index: number): boolean {
  return index >= 0 && index < CELL_COUNT;
}

export function sameRow(a: number, b: number): boolean {
  return rowOf(a) === rowOf(b);
}

export function adjacentCells(index: number): number[] {
  const neighbors: number[] = [];
  const up = index - BOARD_SIZE;
  const down = index + BOARD_SIZE;
  const left = index - 1;
  const right = index + 1;
  if (inBounds(up)) neighbors.push(up);
  if (inBounds(down)) neighbors.push(down);
  if (inBounds(left) && sameRow(left, index)) neighbors.push(left);
  if (inBounds(right) && sameRow(right, index)) neighbors.push(right);
  return neighbors;
}

export function indexToCoord(index: number): string {
  return `${COLUMN_LABELS[colOf(index)]}${rowOf(index) + 1}`;
}
