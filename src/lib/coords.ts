export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export function indexToCoord(index: number): string {
  const col = index % 10;
  const row = Math.floor(index / 10) + 1;
  return `${COLUMN_LABELS[col]}${row}`;
}
