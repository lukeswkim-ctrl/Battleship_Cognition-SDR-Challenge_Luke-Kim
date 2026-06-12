export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type GamePhase = 'playing' | 'ended';

export type Player = 'player' | 'ai';

export interface GameState {
  phase: GamePhase;
  currentTurn: Player;
  playerShips: Set<number>[];
  aiShips: Set<number>[];
  playerAttacks: Set<number>;
  aiAttacks: Set<number>;
  winner: Player | null;
  message: string;
}
