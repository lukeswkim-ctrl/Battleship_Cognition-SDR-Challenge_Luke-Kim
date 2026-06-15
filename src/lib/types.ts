export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type GamePhase = 'playing' | 'ended';

export type Player = 'player' | 'ai';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type AttackResult = 'hit' | 'miss' | 'sunk';

export interface LogEntry {
  actor: Player;
  index: number;
  result: AttackResult;
  shipName?: string;
}

export interface GameState {
  phase: GamePhase;
  currentTurn: Player;
  difficulty: Difficulty;
  playerShips: Set<number>[];
  aiShips: Set<number>[];
  playerAttacks: Set<number>;
  aiAttacks: Set<number>;
  winner: Player | null;
  message: string;
  battleLog: LogEntry[];
}
