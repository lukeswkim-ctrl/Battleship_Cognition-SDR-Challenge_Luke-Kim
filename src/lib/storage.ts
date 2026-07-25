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
  } catch (error) {
    console.warn('Could not read saved difficulty; using default.', error);
  }
  return 'normal';
}

export function saveDifficulty(d: Difficulty): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(DIFFICULTY_KEY, d);
  } catch (error) {
    console.warn('Could not persist difficulty setting.', error);
  }
}

export function loadStats(): LifetimeStats {
  if (!storageAvailable()) return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.version !== 'number' ||
      typeof parsed.gamesPlayed !== 'number'
    ) {
      console.warn('Saved stats are malformed; resetting to defaults.');
      return { ...DEFAULT_STATS };
    }
    if (parsed.version < CURRENT_VERSION) {
      return { ...DEFAULT_STATS };
    }
    return parsed as LifetimeStats;
  } catch (error) {
    console.warn('Could not read saved stats; resetting to defaults.', error);
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: LifetimeStats): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Could not persist lifetime stats.', error);
  }
}

export function resetStats(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (error) {
    console.warn('Could not reset stored stats.', error);
  }
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
