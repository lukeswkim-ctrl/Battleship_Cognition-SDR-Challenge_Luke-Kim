import { useEffect, useRef } from 'react';
import { LogEntry } from '../lib/types';
import { indexToCoord } from '../lib/coords';

function entryText(entry: LogEntry): string {
  const who = entry.actor === 'player' ? 'You' : 'Enemy';
  const coord = indexToCoord(entry.index);
  if (entry.result === 'sunk') {
    return `${who} sunk ${entry.shipName}`;
  }
  const outcome = entry.result === 'hit' ? 'Hit' : 'Miss';
  return `${who} fired at ${coord} \u2192 ${outcome}`;
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
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 mt-6">
      <h3 className="font-bold text-slate-100 mb-2 text-sm">Battle Log</h3>
      <div ref={scrollRef} className="h-40 overflow-y-auto pr-1 space-y-1">
        {ordered.length === 0 ? (
          <p className="text-xs text-slate-500">No shots fired yet.</p>
        ) : (
          ordered.map((entry, i) => {
            const isPlayer = entry.actor === 'player';
            const dot = isPlayer ? 'bg-sky-400' : 'bg-amber-400';
            const resultClass =
              entry.result === 'miss'
                ? 'text-slate-400'
                : entry.result === 'sunk'
                  ? 'text-red-400 font-semibold'
                  : 'text-emerald-400';
            return (
              <div
                key={ordered.length - 1 - i}
                className={`flex items-center gap-2 text-xs ${isPlayer ? 'justify-start' : 'justify-end'}`}
              >
                {isPlayer && <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />}
                <span className={resultClass}>{entryText(entry)}</span>
                {!isPlayer && <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
