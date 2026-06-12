import { Cell } from './Cell';
import { CellState } from '../lib/types';

interface BoardProps {
  title: string;
  ships: Set<number>[];
  attacks: Set<number>;
  showShips: boolean;
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export function Board({
  title,
  ships,
  attacks,
  showShips,
  onCellClick,
  disabled,
}: BoardProps) {
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
      <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-100">{title}</h2>
      <div className="grid grid-cols-10 gap-0.5 bg-slate-700 p-0.5">
        {Array.from({ length: 100 }, (_, index) => (
          <Cell
            key={index}
            state={getCellState(index)}
            onClick={() => onCellClick(index)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
