import { CellState } from '../lib/types';

interface MiniBoardProps {
  title: string;
  ships: Set<number>[];
  attacks: Set<number>;
  showShips: boolean;
}

const miniColors: Record<CellState, string> = {
  empty: 'bg-blue-900',
  ship: 'bg-emerald-700',
  hit: 'bg-red-500',
  miss: 'bg-gray-400',
};

export function MiniBoard({ title, ships, attacks, showShips }: MiniBoardProps) {
  const getCellState = (index: number): CellState => {
    const isAttacked = attacks.has(index);
    const isShip = ships.some((ship) => ship.has(index));
    if (isAttacked && isShip) return 'hit';
    if (isAttacked) return 'miss';
    if (showShips && isShip) return 'ship';
    return 'empty';
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 mb-1 text-center">{title}</h4>
      <div className="grid grid-cols-10 gap-px bg-slate-700 p-px">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${miniColors[getCellState(i)]}`} />
        ))}
      </div>
    </div>
  );
}
