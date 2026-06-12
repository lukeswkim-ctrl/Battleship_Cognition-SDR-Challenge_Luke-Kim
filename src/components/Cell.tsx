import { CellState } from '../lib/types';

interface CellProps {
  state: CellState;
  onClick: () => void;
  disabled: boolean;
}

const stateColors: Record<CellState, string> = {
  empty: 'bg-blue-900',
  ship: 'bg-gray-400',
  hit: 'bg-red-500',
  miss: 'bg-blue-300',
};

const stateAnimations: Partial<Record<CellState, string>> = {
  hit: 'cell-hit',
  miss: 'cell-miss',
};

export function Cell({ state, onClick, disabled }: CellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-11 border border-slate-500 ${stateColors[state]} ${
        stateAnimations[state] ?? ''
      } ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
      }`}
    />
  );
}
