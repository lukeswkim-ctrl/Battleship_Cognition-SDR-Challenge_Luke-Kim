import { Difficulty } from './types';

const DIFFICULTY_KEY = 'battleship_difficulty';
const STATS_KEY = 'battleship_stats';
const CURRENT_VERSION = 1;

export interface LifetimeStats {
  version: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalShotsFired: number;
  totalHits: number;
  currentStreak: number;
  bestAccuracy: number;
  bestGame: { shots: number; difficulty: string; date: string } | null;
}

const DEFAULT_STATS: LifetimeStats = {
  version: CURRENT_VERSION,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  totalShotsFired: 0,
  totalHits: 0,
  currentStreak: 0,
  bestAccuracy: 0,
  bestGame: null,
};

function storageAvailable(): boolean {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadDifficulty(): Difficulty {
  if (!storageAvailable()) return 'normal';
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY);
    if (raw === 'easy' || raw === 'normal' || raw === 'hard') return raw;
  } catch { /* graceful fallback */ }
  return 'normal';
}

export function saveDifficulty(d: Difficulty): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(DIFFICULTY_KEY, d);
  } catch { /* full storage or private browsing */ }
}

const COUNTER_FIELDS = [
  'gamesPlayed',
  'wins',
  'losses',
  'totalShotsFired',
  'totalHits',
  'currentStreak',
  'bestAccuracy',
] as const;

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseBestGame(value: unknown): LifetimeStats['bestGame'] | undefined {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  if (
    !isNonNegativeNumber(raw.shots) ||
    typeof raw.difficulty !== 'string' ||
    typeof raw.date !== 'string'
  ) {
    return undefined;
  }
  return {
    shots: raw.shots,
    difficulty: raw.difficulty.slice(0, 20),
    date: raw.date.slice(0, 10),
  };
}

function parseStats(value: unknown): LifetimeStats | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== CURRENT_VERSION) return null;
  if (!COUNTER_FIELDS.every((field) => isNonNegativeNumber(raw[field]))) return null;
  const bestGame = parseBestGame(raw.bestGame);
  if (bestGame === undefined) return null;

  const stats: LifetimeStats = { ...DEFAULT_STATS, bestGame };
  for (const field of COUNTER_FIELDS) {
    stats[field] = raw[field] as number;
  }
  return stats;
}

export function loadStats(): LifetimeStats {
  if (!storageAvailable()) return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return parseStats(JSON.parse(raw)) ?? { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: LifetimeStats): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch { /* full storage */ }
}

export function resetStats(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch { /* ignore */ }
}

export function recordGameResult(
  prev: LifetimeStats,
  won: boolean,
  shots: number,
  hits: number,
  difficulty: string
): LifetimeStats {
  const accuracy = shots === 0 ? 0 : (hits / shots) * 100;
  const next: LifetimeStats = {
    ...prev,
    gamesPlayed: prev.gamesPlayed + 1,
    wins: prev.wins + (won ? 1 : 0),
    losses: prev.losses + (won ? 0 : 1),
    totalShotsFired: prev.totalShotsFired + shots,
    totalHits: prev.totalHits + hits,
    currentStreak: won ? prev.currentStreak + 1 : 0,
    bestAccuracy: accuracy > prev.bestAccuracy ? accuracy : prev.bestAccuracy,
  };
  if (won && (prev.bestGame === null || shots < prev.bestGame.shots)) {
    next.bestGame = {
      shots,
      difficulty,
      date: new Date().toISOString().slice(0, 10),
    };
  }
  return next;
}
