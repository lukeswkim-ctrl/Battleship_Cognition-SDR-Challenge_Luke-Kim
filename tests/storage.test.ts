import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadDifficulty,
  saveDifficulty,
  loadStats,
  saveStats,
  resetStats,
  recordGameResult,
  LifetimeStats,
} from '../src/lib/storage';

const DIFFICULTY_KEY = 'battleship_difficulty';
const STATS_KEY = 'battleship_stats';

const DEFAULT_STATS: LifetimeStats = {
  version: 1,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  totalShotsFired: 0,
  totalHits: 0,
  currentStreak: 0,
  bestAccuracy: 0,
  bestGame: null,
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('loadDifficulty / saveDifficulty', () => {
  it('defaults to normal when nothing is stored', () => {
    expect(loadDifficulty()).toBe('normal');
  });

  it('round-trips each valid difficulty', () => {
    for (const d of ['easy', 'normal', 'hard'] as const) {
      saveDifficulty(d);
      expect(loadDifficulty()).toBe(d);
    }
  });

  it('persists the raw value under the expected key', () => {
    saveDifficulty('hard');
    expect(localStorage.getItem(DIFFICULTY_KEY)).toBe('hard');
  });

  it('falls back to normal for an unrecognized stored value', () => {
    localStorage.setItem(DIFFICULTY_KEY, 'impossible');
    expect(loadDifficulty()).toBe('normal');
  });
});

describe('loadStats', () => {
  it('returns default stats when nothing is stored', () => {
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('returns a fresh copy (not the shared default object)', () => {
    const a = loadStats();
    a.wins = 99;
    expect(loadStats().wins).toBe(0);
  });

  it('returns stored stats when valid', () => {
    const stats: LifetimeStats = { ...DEFAULT_STATS, gamesPlayed: 3, wins: 2 };
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    expect(loadStats()).toEqual(stats);
  });

  it('returns defaults for malformed JSON', () => {
    localStorage.setItem(STATS_KEY, 'not json');
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('returns defaults when shape is invalid (missing numeric fields)', () => {
    localStorage.setItem(STATS_KEY, JSON.stringify({ version: 1, wins: 5 }));
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('returns defaults for a null payload', () => {
    localStorage.setItem(STATS_KEY, JSON.stringify(null));
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });

  it('discards stats from an older schema version', () => {
    const old = { ...DEFAULT_STATS, version: 0, gamesPlayed: 10 };
    localStorage.setItem(STATS_KEY, JSON.stringify(old));
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });
});

describe('saveStats', () => {
  it('persists stats readable by loadStats', () => {
    const stats: LifetimeStats = { ...DEFAULT_STATS, gamesPlayed: 7, losses: 4 };
    saveStats(stats);
    expect(loadStats()).toEqual(stats);
  });
});

describe('resetStats', () => {
  it('removes stored stats so loadStats returns defaults', () => {
    saveStats({ ...DEFAULT_STATS, gamesPlayed: 5 });
    resetStats();
    expect(localStorage.getItem(STATS_KEY)).toBeNull();
    expect(loadStats()).toEqual(DEFAULT_STATS);
  });
});

describe('recordGameResult', () => {
  it('records a win: increments games, wins, streak, and totals', () => {
    const next = recordGameResult(DEFAULT_STATS, true, 40, 17, 'normal');
    expect(next.gamesPlayed).toBe(1);
    expect(next.wins).toBe(1);
    expect(next.losses).toBe(0);
    expect(next.currentStreak).toBe(1);
    expect(next.totalShotsFired).toBe(40);
    expect(next.totalHits).toBe(17);
  });

  it('records a loss: increments losses and resets the streak', () => {
    const prev: LifetimeStats = { ...DEFAULT_STATS, currentStreak: 3, wins: 3 };
    const next = recordGameResult(prev, false, 50, 10, 'hard');
    expect(next.losses).toBe(1);
    expect(next.wins).toBe(3);
    expect(next.currentStreak).toBe(0);
  });

  it('does not mutate the previous stats object', () => {
    const prev = { ...DEFAULT_STATS };
    recordGameResult(prev, true, 20, 17, 'easy');
    expect(prev).toEqual(DEFAULT_STATS);
  });

  it('updates bestAccuracy when the new game is more accurate', () => {
    const next = recordGameResult(DEFAULT_STATS, true, 20, 17, 'normal');
    expect(next.bestAccuracy).toBeCloseTo(85);
  });

  it('keeps the previous bestAccuracy when the new game is worse', () => {
    const prev: LifetimeStats = { ...DEFAULT_STATS, bestAccuracy: 90 };
    const next = recordGameResult(prev, true, 100, 17, 'normal');
    expect(next.bestAccuracy).toBe(90);
  });

  it('treats zero shots as zero accuracy', () => {
    const next = recordGameResult(DEFAULT_STATS, false, 0, 0, 'normal');
    expect(next.bestAccuracy).toBe(0);
  });

  it('sets bestGame on a first win with the current date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-25T12:00:00Z'));
    const next = recordGameResult(DEFAULT_STATS, true, 30, 17, 'hard');
    expect(next.bestGame).toEqual({ shots: 30, difficulty: 'hard', date: '2026-07-25' });
    vi.useRealTimers();
  });

  it('replaces bestGame only when the new win uses fewer shots', () => {
    const prev: LifetimeStats = {
      ...DEFAULT_STATS,
      bestGame: { shots: 25, difficulty: 'normal', date: '2026-01-01' },
    };
    const better = recordGameResult(prev, true, 20, 17, 'hard');
    expect(better.bestGame?.shots).toBe(20);

    const worse = recordGameResult(prev, true, 40, 17, 'hard');
    expect(worse.bestGame?.shots).toBe(25);
  });

  it('does not set bestGame on a loss', () => {
    const next = recordGameResult(DEFAULT_STATS, false, 10, 5, 'easy');
    expect(next.bestGame).toBeNull();
  });
});
