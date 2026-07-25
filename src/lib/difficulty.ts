import { Difficulty } from './types';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = (
  ['easy', 'normal', 'hard'] as Difficulty[]
).map((value) => ({ value, label: DIFFICULTY_LABELS[value] }));

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
