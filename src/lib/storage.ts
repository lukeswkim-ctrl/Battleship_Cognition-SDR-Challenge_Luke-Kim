import { Difficulty } from './types';
import { isDifficulty } from './difficulty';
import { accuracyPercent } from './fleet';
import { readItem, removeItem, writeItem } from './persist';

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
  const raw = readItem(DIFFICULTY_KEY);
  return isDifficulty(raw) ? raw : 'normal';
}

export function saveDifficulty(d: Difficulty): void {
  if (!storageAvailable()) return;
  writeItem(DIFFICULTY_KEY, d);
}

export function loadStats(): LifetimeStats {
  if (!storageAvailable()) return { ...DEFAULT_STATS };
  const raw = readItem(STATS_KEY);
  if (!raw) return { ...DEFAULT_STATS };
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.version !== 'number' ||
      typeof parsed.gamesPlayed !== 'number'
    ) {
      return { ...DEFAULT_STATS };
    }
    if (parsed.version < CURRENT_VERSION) {
      return { ...DEFAULT_STATS };
    }
    return parsed as LifetimeStats;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: LifetimeStats): void {
  if (!storageAvailable()) return;
  writeItem(STATS_KEY, JSON.stringify(stats));
}

export function resetStats(): void {
  if (!storageAvailable()) return;
  removeItem(STATS_KEY);
}

export function recordGameResult(
  prev: LifetimeStats,
  won: boolean,
  shots: number,
  hits: number,
  difficulty: string
): LifetimeStats {
  const accuracy = accuracyPercent(hits, shots);
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
