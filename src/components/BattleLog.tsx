import { useEffect, useRef } from 'react';
import { LogEntry } from '../lib/types';
import { indexToCoord } from '../lib/coords';

function outcomeText(entry: LogEntry): string {
  if (entry.result === 'sunk') return `Sunk ${entry.shipName}`;
  return entry.result === 'hit' ? 'Hit' : 'Miss';
}

function outcomeClass(entry: LogEntry): string {
  if (entry.result === 'sunk') return 'text-red-400 font-semibold';
  return entry.result === 'hit' ? 'text-emerald-400' : 'text-slate-400';
}

export function BattleLog({ entries }: { entries: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries.length]);

  const ordered = [...entries].reverse();

  return (
    <div className="w-full md:w-56 bg-slate-900 rounded p-3">
      <h3 className="font-bold text-slate-100 mb-2 text-sm">Battle Log</h3>
      <div ref={scrollRef} className="h-44 overflow-y-auto pr-1 space-y-1">
        {ordered.length === 0 ? (
          <p className="text-xs text-slate-500">No shots fired yet.</p>
        ) : (
          ordered.map((entry, i) => {
            const isPlayer = entry.actor === 'player';
            const chipClass = isPlayer
              ? 'bg-sky-500/20 text-sky-300'
              : 'bg-amber-500/20 text-amber-300';
            return (
              <div
                key={ordered.length - 1 - i}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className={`w-12 text-center shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold ${chipClass}`}
                >
                  {isPlayer ? 'You' : 'Enemy'}
                </span>
                <span className="w-7 shrink-0 font-mono text-slate-300">
                  {indexToCoord(entry.index)}
                </span>
                <span className={`truncate ${outcomeClass(entry)}`}>{outcomeText(entry)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
