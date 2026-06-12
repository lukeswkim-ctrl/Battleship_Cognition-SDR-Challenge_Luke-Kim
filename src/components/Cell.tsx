import { CellState } from '../lib/types';

interface CellProps {
  state: CellState;
  onClick: () => void;
  disabled: boolean;
}

const stateColors: Record<CellState, string> = {
  empty: 'bg-slate-300',
  ship: 'bg-slate-600',
  hit: 'bg-red-600',
  miss: 'bg-sky-200',
};

export function Cell({ state, onClick, disabled }: CellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-11 border border-slate-500 ${stateColors[state]} ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
      }`}
    />
  );
}
