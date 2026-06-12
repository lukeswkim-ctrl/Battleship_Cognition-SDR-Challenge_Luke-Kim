import { CellState } from '../lib/types';

interface CellProps {
  state: CellState;
  onClick: () => void;
  disabled: boolean;
  shipIndex?: number;
}

const stateColors: Record<CellState, string> = {
  empty: 'bg-blue-900',
  ship: 'cell-camo',
  hit: 'bg-red-500',
  miss: 'bg-blue-300',
};

const stateAnimations: Partial<Record<CellState, string>> = {
  hit: 'cell-hit',
  miss: 'cell-miss',
};

export function Cell({ state, onClick, disabled, shipIndex }: CellProps) {
  const colorClass =
    state === 'ship' && shipIndex !== undefined
      ? `cell-camo cell-camo-${shipIndex}`
      : stateColors[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 border border-slate-500 ${colorClass} ${
        stateAnimations[state] ?? ''
      } ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
      }`}
    />
  );
}
