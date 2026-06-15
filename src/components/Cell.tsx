import { CellState } from '../lib/types';

interface CellProps {
  state: CellState;
  onClick: () => void;
  disabled: boolean;
  shipIndex?: number;
  isTargetable?: boolean;
  isSunk?: boolean;
}

const stateColors: Record<CellState, string> = {
  empty: 'bg-blue-900',
  ship: 'cell-camo',
  hit: 'bg-red-500',
  miss: 'bg-gray-400',
};

const stateAnimations: Partial<Record<CellState, string>> = {
  hit: 'cell-hit',
  miss: 'cell-miss',
};

export function Cell({ state, onClick, disabled, shipIndex, isTargetable, isSunk }: CellProps) {
  const colorClass =
    isSunk && state === 'hit'
      ? 'bg-orange-700'
      : state === 'ship' && shipIndex !== undefined
        ? `cell-camo cell-camo-${shipIndex}`
        : stateColors[state];

  let interactionClass: string;
  if (disabled && (state === 'hit' || state === 'miss')) {
    interactionClass = 'cursor-not-allowed opacity-70';
  } else if (disabled) {
    interactionClass = 'cursor-not-allowed opacity-60';
  } else if (isTargetable) {
    interactionClass =
      'cursor-crosshair hover:ring-2 hover:ring-amber-400 hover:ring-inset hover:brightness-125 transition-all duration-100';
  } else {
    interactionClass = 'cursor-pointer hover:opacity-80';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 border ${isSunk && state === 'hit' ? 'border-orange-400' : 'border-slate-500'} ${colorClass} ${
        stateAnimations[state] ?? ''
      } ${interactionClass}`}
    >
      {isSunk && state === 'hit' && (
        <span className="text-orange-200 text-[10px] sm:text-xs font-bold select-none">✕</span>
      )}
    </button>
  );
}
