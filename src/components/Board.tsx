import { Cell } from './Cell';
import { CellState } from '../lib/types';
import { COLUMN_LABELS, ROW_LABELS } from '../lib/coords';

export interface CellFlash {
  index: number;
  text: string;
  kind: 'hit' | 'miss' | 'sunk';
}

interface BoardProps {
  title: string;
  ships: Set<number>[];
  attacks: Set<number>;
  showShips: boolean;
  onCellClick: (index: number) => void;
  disabled: boolean;
  onCellHover?: (index: number | null) => void;
  flash?: CellFlash | null;
  isTargetable?: boolean;
}

export function Board({
  title,
  ships,
  attacks,
  showShips,
  onCellClick,
  disabled,
  onCellHover,
  flash,
  isTargetable,
}: BoardProps) {
  const getCellState = (index: number): CellState => {
    const isAttacked = attacks.has(index);
    const isShip = ships.some((ship) => ship.has(index));

    if (isAttacked && isShip) return 'hit';
    if (isAttacked) return 'miss';
    if (showShips && isShip) return 'ship';
    return 'empty';
  };

  const getShipIndex = (index: number): number | undefined => {
    const shipIndex = ships.findIndex((ship) => ship.has(index));
    return shipIndex === -1 ? undefined : shipIndex;
  };

  const rowLabelClass = 'w-4 sm:w-5 md:w-6 shrink-0';
  const cellLabelClass = 'w-7 sm:w-9 md:w-11 shrink-0';

  return (
    <div>
      <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-100 pl-[1.125rem] sm:pl-[1.375rem] md:pl-[1.625rem]">{title}</h2>
      <div className="inline-block">
        {/* Column labels (A–J) */}
        <div className="flex pb-0.5">
          <div className={`${rowLabelClass} pr-0.5`} />
          <div className="flex gap-0.5 pl-0.5">
            {COLUMN_LABELS.map((label) => (
              <div
                key={label}
                className={`${cellLabelClass} text-center text-[10px] sm:text-xs font-semibold text-slate-400`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          {/* Row labels (1–10) */}
          <div className="flex flex-col gap-0.5 pt-0.5 pr-0.5">
            {ROW_LABELS.map((label) => (
              <div
                key={label}
                className={`${rowLabelClass} h-7 sm:h-9 md:h-11 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-slate-400`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-0.5 bg-slate-700 p-0.5">
            {Array.from({ length: 100 }, (_, index) => (
              <span
                key={index}
                className="relative flex"
                onMouseEnter={onCellHover ? () => onCellHover(index) : undefined}
                onMouseLeave={onCellHover ? () => onCellHover(null) : undefined}
              >
                <Cell
                  state={getCellState(index)}
                  shipIndex={getShipIndex(index)}
                  onClick={() => onCellClick(index)}
                  disabled={disabled}
                  isTargetable={isTargetable && !attacks.has(index)}
                />
                {flash && flash.index === index && (
                  <span className={`float-label float-label-${flash.kind}`}>{flash.text}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
