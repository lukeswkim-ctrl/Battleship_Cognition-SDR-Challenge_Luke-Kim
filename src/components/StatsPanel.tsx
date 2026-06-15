import { useState } from 'react';
import { LifetimeStats } from '../lib/storage';

interface StatsPanelProps {
  stats: LifetimeStats;
  onReset: () => void;
}

export function StatsPanel({ stats, onReset }: StatsPanelProps) {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const lifetimeAccuracy =
    stats.totalShotsFired === 0
      ? '0'
      : ((stats.totalHits / stats.totalShotsFired) * 100).toFixed(1);

  const bestGameLabel = stats.bestGame
    ? `${stats.bestGame.shots} shots on ${stats.bestGame.difficulty.charAt(0).toUpperCase() + stats.bestGame.difficulty.slice(1)} (${stats.bestGame.date})`
    : '—';

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onReset();
    setConfirmReset(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-slate-400 text-xs hover:text-slate-200 underline underline-offset-2"
      >
        Stats
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 w-64">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-slate-100">Lifetime Stats</span>
        <button
          type="button"
          onClick={() => { setOpen(false); setConfirmReset(false); }}
          className="text-slate-500 hover:text-slate-300 text-xs"
        >
          Close
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Games:</span>
          <span className="text-slate-100">
            {stats.wins}–{stats.losses}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <span className="text-slate-100">{lifetimeAccuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span>Current streak:</span>
          <span className="text-slate-100">{stats.currentStreak} win{stats.currentStreak !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between">
          <span>Best game:</span>
          <span className="text-slate-100 text-right text-xs ml-2">{bestGameLabel}</span>
        </div>
      </div>
      <div className="mt-3 border-t border-slate-700 pt-2 flex justify-end">
        {confirmReset ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-400">Reset all stats?</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-500 hover:text-red-400 text-xs underline underline-offset-2"
          >
            Reset Stats
          </button>
        )}
      </div>
    </div>
  );
}
