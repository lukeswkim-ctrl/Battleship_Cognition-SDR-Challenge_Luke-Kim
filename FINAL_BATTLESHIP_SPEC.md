```markdown
# FINAL_BATTLESHIP_SPEC.md

**Project:** Browser-Based Battleship Game  
**Target:** Weekend Delivery (Friday → Sunday)  
**Priority:** Stability > Features  
**Deployment:** Netlify

---

## 1. Project Overview

Build a browser-based Battleship game where a human player competes against an AI opponent. The game must be fully functional, tested, and deployed as a static web application.

**Core Requirements:**
- Human vs AI gameplay
- 10x10 grid for each player
- 5 ships per player (standard Battleship rules)
- Random ship placement (no manual placement)
- Turn-based combat
- Win/loss detection
- Deployable to Netlify

**Technical Stack:**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Vitest (testing)
- Netlify (hosting)

---

## 2. Architecture

### 2.1 Design Principles

- **Pure Logic Layer:** All game logic in pure TypeScript functions (no React dependencies)
- **Simple State Management:** React useState only (no Context, no Reducer)
- **Flat Data Structures:** Use flat array indices (0-99) and Sets for all collections
- **Immutable Updates:** Always create new objects/Sets, never mutate state
- **Desktop-First:** No mobile responsive requirements
- **Chrome-Only:** No cross-browser testing required

### 2.2 Coordinate System

**CRITICAL:** Use flat indices (0-99) throughout entire codebase.

- **Grid:** 10x10 = 100 cells
- **Indexing:** Row-major order (left-to-right, top-to-bottom)
- **Formula:** `index = row * 10 + col`
- **Range:** 0-99
- **Never use:** x/y coordinates, 2D arrays, or row/col tuples

### 2.3 State Structure

```typescript
{
  phase: 'playing' | 'ended',
  currentTurn: 'player' | 'ai',
  playerShips: Set<number>,      // 17 cell indices
  aiShips: Set<number>,          // 17 cell indices
  playerAttacks: Set<number>,    // all attacks (hits + misses)
  aiAttacks: Set<number>,        // all attacks (hits + misses)
  winner: 'player' | 'ai' | null,
  message: string
}
```

### 2.4 Data Flow

```
Player clicks cell
  ↓
handlePlayerAttack(index)
  ↓
Validate (phase, turn, not already attacked)
  ↓
Update playerAttacks Set
  ↓
Check win condition
  ↓
If not won: switch turn to 'ai'
  ↓
useEffect triggers handleAIAttack (600ms delay)
  ↓
Update aiAttacks Set
  ↓
Check win condition
  ↓
Switch turn to 'player'
```

---

## 3. Folder Structure

```
battleship/
├── src/
│   ├── lib/
│   │   ├── types.ts           # Type definitions
│   │   ├── game.ts            # Core game logic (pure functions)
│   │   └── ai.ts              # AI logic (pure function)
│   ├── components/
│   │   ├── Cell.tsx           # Single grid cell
│   │   ├── Board.tsx          # 10x10 grid
│   │   └── Game.tsx           # Main game orchestrator
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind + global styles
├── tests/
│   └── game.test.ts           # Unit tests
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml
└── README.md
```

**Total Files:** 16

---

## 4. MVP Scope

### Must Have

- ✅ Random ship placement for both players (no manual placement)
- ✅ Two-board display (player board, AI board)
- ✅ Click-to-attack on AI board
- ✅ Hit/miss visual feedback (red/blue)
- ✅ AI responds automatically after player attack
- ✅ Win/loss detection
- ✅ New Game button
- ✅ Player ships always visible
- ✅ AI ships hidden until game ends
- ✅ No duplicate attacks allowed
- ✅ Turn-based gameplay

### Ship Configuration

**Standard Battleship rules:**
- Carrier: 5 cells
- Battleship: 4 cells
- Cruiser: 3 cells
- Submarine: 3 cells
- Destroyer: 2 cells
- **Total:** 5 ships, 17 cells

**Placement Rules:**
- All ships horizontal only (no rotation)
- No overlap
- Must fit within grid bounds
- Can be adjacent (no spacing requirement)

---

## 5. Explicitly Excluded Features

### Do NOT Implement

- ❌ Manual ship placement
- ❌ Drag-and-drop
- ❌ Ship rotation
- ❌ Smart AI (hunt/target mode)
- ❌ Difficulty levels
- ❌ Multiplayer
- ❌ Animations (CSS transitions ok)
- ❌ Sound effects
- ❌ Game statistics/history
- ❌ Save/load game
- ❌ Mobile responsive layout
- ❌ Accessibility features beyond semantic HTML
- ❌ Cross-browser testing (Chrome only)
- ❌ Context API or Reducer
- ❌ State management libraries

---

## 6. Implementation Plan

### Phase 1: Core Logic (Priority 1)

**File:** `src/lib/types.ts`

```typescript
export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type GamePhase = 'playing' | 'ended';

export type Player = 'player' | 'ai';

export interface GameState {
  phase: GamePhase;
  currentTurn: Player;
  playerShips: Set<number>;
  aiShips: Set<number>;
  playerAttacks: Set<number>;
  aiAttacks: Set<number>;
  winner: Player | null;
  message: string;
}
```

**File:** `src/lib/game.ts`

Implement these pure functions:

**`isValidPlacement(startIndex: number, length: number, occupied: Set<number>): boolean`**
- Returns false if:
  - `startIndex < 0` or `startIndex > 99`
  - `startIndex + length - 1 > 99` (out of bounds)
  - `Math.floor(startIndex / 10) !== Math.floor((startIndex + length - 1) / 10)` (wraps row)
  - Any cell in range overlaps with occupied Set
- Returns true otherwise

**`placeShip(length: number, occupied: Set<number>): Set<number>`**
- Attempts random placement (max 1000 tries)
- Returns Set of ship cell indices
- Throws error if placement fails after 1000 attempts

**`placeAllShips(): Set<number>`**
- Places ships with lengths [5, 4, 3, 3, 2]
- Returns Set of all 17 ship cell indices

**`isAllShipsSunk(attacks: Set<number>, ships: Set<number>): boolean`**
- Returns true if all ship cells have been attacked
- Algorithm: `for (const ship of ships) { if (!attacks.has(ship)) return false; } return true;`

**`initializeGame(): GameState`**
- Returns fresh game state with:
  - phase: 'playing'
  - currentTurn: 'player'
  - playerShips: placeAllShips()
  - aiShips: placeAllShips()
  - playerAttacks: new Set()
  - aiAttacks: new Set()
  - winner: null
  - message: 'Your turn. Click enemy waters to attack.'

**File:** `src/lib/ai.ts`

**`getAIMove(previousAttacks: Set<number>): number`**
- Creates array of available cells (0-99 not in previousAttacks)
- Returns random element from available cells
- Throws error if no moves available

---

### Phase 2: Testing (Priority 1)

**File:** `tests/game.test.ts`

**Required Test Suites:**

**isValidPlacement:**
- ✓ length 5, start 0, empty → true
- ✓ length 5, start 6, empty → false (wraps row)
- ✓ length 5, start 96, empty → false (out of bounds)
- ✓ length 3, start 10, occupied [11] → false (overlap)
- ✓ length 3, start 10, occupied [13] → true (no overlap)
- ✓ length 2, start 9, empty → false (wraps row)
- ✓ length 1, start 99, empty → true (edge case)
- ✓ length 10, start 0, empty → true (full row)
- ✓ length 10, start 1, empty → false (wraps)

**placeShip:**
- ✓ Returns Set of correct size
- ✓ All indices valid (0-99)
- ✓ Indices are consecutive
- ✓ Does not overlap with occupied cells

**placeAllShips:**
- ✓ Returns Set of exactly 17 cells
- ✓ All indices valid (0-99)
- ✓ Succeeds on 20 consecutive runs

**isAllShipsSunk:**
- ✓ attacks [1,2,3], ships [1,2,3] → true
- ✓ attacks [1,2], ships [1,2,3] → false
- ✓ attacks [1,2,3,4,5], ships [1,2,3] → true
- ✓ attacks [], ships [1,2,3] → false
- ✓ attacks [4,5,6], ships [1,2,3] → false

**getAIMove:**
- ✓ Returns valid index (0-99)
- ✓ Never returns attacked cell
- ✓ Throws error when no moves available
- ✓ Works with 99 cells attacked (1 remaining)

**initializeGame:**
- ✓ Returns correct initial values
- ✓ playerShips.size === 17
- ✓ aiShips.size === 17
- ✓ phase === 'playing'
- ✓ currentTurn === 'player'

**CHECKPOINT:** All tests must pass before proceeding to UI.

---

### Phase 3: UI Components (Priority 2)

**File:** `src/components/Cell.tsx`

```typescript
interface CellProps {
  state: CellState;
  onClick: () => void;
  disabled: boolean;
}
```

**Rendering:**
- Element: `<button>`
- Size: 44px × 44px (w-11 h-11)
- Border: 1px solid #64748b
- Background colors:
  - empty: #cbd5e1 (bg-slate-300)
  - ship: #475569 (bg-slate-600)
  - hit: #dc2626 (bg-red-600)
  - miss: #e0f2fe (bg-sky-200)
- Cursor: pointer when enabled, not-allowed when disabled
- Hover: opacity-80 when enabled
- Disabled: opacity-60

**File:** `src/components/Board.tsx`

```typescript
interface BoardProps {
  title: string;
  ships: Set<number>;
  attacks: Set<number>;
  showShips: boolean;
  onCellClick: (index: number) => void;
  disabled: boolean;
}
```

**Cell State Logic (inline in component):**
```typescript
const getCellState = (index: number): CellState => {
  const isAttacked = attacks.has(index);
  const isShip = ships.has(index);

  if (isAttacked && isShip) return 'hit';
  if (isAttacked) return 'miss';
  if (showShips && isShip) return 'ship';
  return 'empty';
};
```

**Rendering:**
- Title: h2, text-xl, font-bold, mb-4, text-slate-100
- Grid: 10 columns, gap-0.5, bg-slate-700, p-0.5
- Cells: 100 Cell components (indices 0-99)

**File:** `src/components/Game.tsx`

**State:**
```typescript
const [game, setGame] = useState<GameState>(() => initializeGame());
```

**Event Handlers:**

**handlePlayerAttack(index: number):**
```typescript
// Guards (in this exact order)
if (game.phase !== 'playing') return;
if (game.currentTurn !== 'player') return;
if (game.playerAttacks.has(index)) return;

// Process attack
const newAttacks = new Set(game.playerAttacks);
newAttacks.add(index);
const isHit = game.aiShips.has(index);

// Check win
if (isAllShipsSunk(newAttacks, game.aiShips)) {
  setGame({
    ...game,
    playerAttacks: newAttacks,
    phase: 'ended',
    winner: 'player',
    message: 'You win! All enemy ships destroyed.',
  });
  return;
}

// Continue game
setGame({
  ...game,
  playerAttacks: newAttacks,
  currentTurn: 'ai',
  message: isHit ? 'Hit!' : 'Miss.',
});
```

**handleAIAttack():**
```typescript
// Guards
if (game.phase !== 'playing') return;
if (game.currentTurn !== 'ai') return;

try {
  const aiMove = getAIMove(game.aiAttacks);
  const newAttacks = new Set(game.aiAttacks);
  newAttacks.add(aiMove);
  const isHit = game.playerShips.has(aiMove);

  // Check win
  if (isAllShipsSunk(newAttacks, game.playerShips)) {
    setGame({
      ...game,
      aiAttacks: newAttacks,
      phase: 'ended',
      winner: 'ai',
      message: 'AI wins! All your ships destroyed.',
    });
    return;
  }

  // Continue game
  setGame({
    ...game,
    aiAttacks: newAttacks,
    currentTurn: 'player',
    message: isHit ? 'AI hit your ship!' : 'AI missed.',
  });
} catch (error) {
  console.error('AI move failed:', error);
}
```

**handleNewGame():**
```typescript
setGame(initializeGame());
```

**useEffect for AI Turn:**
```typescript
useEffect(() => {
  if (game.currentTurn === 'ai' && game.phase === 'playing') {
    const timer = setTimeout(() => {
      handleAIAttack();
    }, 600);
    return () => clearTimeout(timer);
  }
}, [game.currentTurn, game.phase]);
```

**Layout:**
- Container: min-h-screen, bg-slate-900, flex, flex-col, items-center, justify-center, p-8
- Title: h1, text-4xl, font-bold, text-slate-100, mb-4
- Message: p, text-lg, text-slate-300, mb-4
- New Game button: px-6, py-3, bg-blue-600, text-white, font-semibold, rounded, hover:bg-blue-700, mb-8
- Boards container: flex, gap-8

**Board Configuration:**

Player Board:
- title: "Your Fleet"
- ships: game.playerShips
- attacks: game.aiAttacks
- showShips: true
- onCellClick: () => {}
- disabled: true

AI Board:
- title: "Enemy Waters"
- ships: game.aiShips
- attacks: game.playerAttacks
- showShips: game.phase === 'ended'
- onCellClick: handlePlayerAttack
- disabled: game.currentTurn !== 'player' || game.phase !== 'playing'

**File:** `src/App.tsx`

```typescript
import { Game } from './components/Game';

function App() {
  return <Game />;
}

export default App;
```

**File:** `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
```

---

### Phase 4: Configuration (Priority 3)

**File:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**File:** `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**File:** `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**File:** `package.json` (add scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

### Phase 5: Documentation & Deployment (Priority 4)

**File:** `README.md`

```markdown
# Battleship Game

Browser-based Battleship game: Human vs AI

**Live Demo:** [DEPLOY_URL_HERE]

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Vitest

## Setup

```bash
npm install
npm run dev    # http://localhost:5173
npm test       # run tests
npm run build  # production build
```

## How to Play

1. Click "New Game" to start
2. Click cells on the AI board (right side) to attack
3. Red = hit, Blue = miss
4. Sink all 5 enemy ships to win

## Game Rules

- 5 ships per player: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Ships are placed horizontally
- Turn-based gameplay
- First to sink all opponent ships wins

## Project Structure

```
src/
├── lib/          # Core game logic
│   ├── types.ts
│   ├── game.ts
│   └── ai.ts
├── components/   # React components
│   ├── Cell.tsx
│   ├── Board.tsx
│   └── Game.tsx
└── App.tsx
```
```

---

## 7. Testing Requirements

### Unit Test Coverage

**Target:** >80% coverage for `src/lib/game.ts`

**Framework:** Vitest with globals enabled

**Test File:** `tests/game.test.ts`

**Required Tests:** See Phase 2 in Implementation Plan

**Test Execution:**
```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

**All tests must pass before deployment.**

### Manual Testing Checklist

Before deployment, verify:

- [ ] Game starts with ships placed on both boards
- [ ] Player board shows player's ships (gray cells)
- [ ] AI board hides AI's ships initially
- [ ] Clicking AI board cell registers attack
- [ ] Hit shows red, miss shows light blue
- [ ] Cannot click same cell twice
- [ ] Cannot click player's own board
- [ ] Cannot click during AI turn
- [ ] AI responds within 1 second of player attack
- [ ] AI never attacks same cell twice
- [ ] Game detects player win correctly
- [ ] Game detects AI win correctly
- [ ] AI ships revealed when game ends
- [ ] New Game button resets everything
- [ ] New game generates different ship placements
- [ ] No console errors
- [ ] No React warnings in console

---

## 8. Acceptance Criteria

### Functional Requirements

**Must Work:**
- ✅ Game initializes with random ship placements for both players
- ✅ Player can attack AI board by clicking cells
- ✅ AI automatically attacks after player's turn
- ✅ Hit/miss feedback is immediate and accurate
- ✅ Game correctly detects when all ships are sunk
- ✅ Winner is announced when game ends
- ✅ New Game button fully resets game state
- ✅ No duplicate attacks allowed (player or AI)
- ✅ Player cannot attack during AI turn
- ✅ Player cannot attack after game ends
- ✅ Player's ships always visible on player board
- ✅ AI's ships hidden until game ends

**Must Not Exist:**
- ❌ No drag-and-drop
- ❌ No ship rotation
- ❌ No manual ship placement
- ❌ No smart AI (hunt/target mode)
- ❌ No difficulty settings
- ❌ No animations (CSS transitions ok)
- ❌ No sound effects
- ❌ No game history/statistics
- ❌ No multiplayer

### Code Quality Requirements

- ✅ TypeScript strict mode enabled
- ✅ No `any` types
- ✅ No `@ts-ignore` comments
- ✅ Immutable state updates (no mutations)
- ✅ Pure functions in lib/ (no side effects)
- ✅ All tests pass
- ✅ Build completes without errors
- ✅ No console errors or warnings

### Browser Compatibility

- ✅ Chrome 100+ (primary target)
- ❌ Other browsers not required

### Performance

- ✅ Click response <100ms
- ✅ AI move delay 600ms ± 50ms
- ✅ Build output <300KB gzipped

---

## 9. Deployment Requirements

### Pre-Deployment Verification

**Run in exact order:**

```bash
# 1. Run tests
npm test
# VERIFY: All tests pass

# 2. Type check
npx tsc --noEmit
# VERIFY: No errors

# 3. Build
npm run build
# VERIFY: Build succeeds, dist/ created

# 4. Preview
npm run preview
# VERIFY: Game playable at http://localhost:4173
# VERIFY: No console errors
# Stop server (Ctrl+C) before deploying
```

### Deployment to Netlify

**Option 1: Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init
# Follow prompts:
# - Create new site
# - Build command: npm run build
# - Publish directory: dist
netlify deploy --prod
```

**Option 2: Netlify UI**

1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Post-Deployment Verification

- [ ] Site loads at Netlify URL
- [ ] "New Game" button works
- [ ] Can click AI board cells
- [ ] Hits show as red
- [ ] Misses show as blue
- [ ] Player ships visible on left board
- [ ] AI ships hidden on right board until game ends
- [ ] Cannot click same cell twice
- [ ] AI responds after player attack
- [ ] Game detects player win correctly
- [ ] Game detects AI win correctly
- [ ] AI ships revealed when game ends
- [ ] "New Game" resets everything
- [ ] No errors in browser console (F12 → Console)

**After deployment:** Update README.md with actual Netlify URL

---

## 10. Bug Prevention Requirements

### Critical Implementation Rules

**Rule 1: Immutable State Updates**

**ALWAYS:**
```typescript
const newSet = new Set(oldSet);
newSet.add(item);
setGame({ ...game, field: newSet });
```

**NEVER:**
```typescript
game.field.add(item);  // Mutates state
setGame(game);         // Same reference
```

**Rule 2: Guard Clauses**

**ALWAYS check in this exact order:**
```typescript
if (game.phase !== 'playing') return;
if (game.currentTurn !== 'player') return;
if (game.playerAttacks.has(index)) return;
```

**NEVER combine:**
```typescript
if (game.phase === 'playing' && game.currentTurn === 'player') { }
```

**Rule 3: Set Operations**

**ALWAYS:**
```typescript
if (set.has(value)) { }
const newSet = new Set(oldSet);
```

**NEVER:**
```typescript
if (set.includes(value)) { }  // Sets don't have includes
set.add(value);               // Mutates Set
```

**Rule 4: useEffect Dependencies**

**ALWAYS:**
```typescript
useEffect(() => {
  // ...
}, [game.currentTurn, game.phase]);
```

**NEVER:**
```typescript
useEffect(() => {
  // ...
}, [game]);  // Too broad - causes infinite loops
```

**Rule 5: Array Generation**

**ALWAYS:**
```typescript
Array.from({ length: 100 }, (_, index) => ...)
```

**NEVER:**
```typescript
[...Array(100)].map((_, index) => ...)  // Creates sparse array
```

### High-Risk Areas

**1. Ship Placement**
- Risk: Infinite loops, placement failures
- Prevention: Max 1000 attempts, throw clear error
- Testing: Run placeAllShips() 20 times in tests

**2. Turn Management**
- Risk: Double moves, race conditions
- Prevention: Guard clauses, disabled state on boards
- Testing: Manual verification of turn switching

**3. State Mutations**
- Risk: React not detecting changes
- Prevention: Always create new Sets/objects
- Testing: Verify state updates trigger re-renders

**4. Coordinate System**
- Risk: Off-by-one errors, row wrapping
- Prevention: Use flat indices only, extensive validation
- Testing: Edge case tests for indices 9, 19, 29, etc.

### Common Errors to Avoid

**Error 1: Mutating State**
```typescript
// WRONG
game.playerAttacks.add(index);

// CORRECT
const newAttacks = new Set(game.playerAttacks);
newAttacks.add(index);
setGame({ ...game, playerAttacks: newAttacks });
```

**Error 2: Missing Guard Clauses**
```typescript
// WRONG
const handlePlayerAttack = (index: number) => {
  const newAttacks = new Set(game.playerAttacks);
  // ... continues without checks
}

// CORRECT
const handlePlayerAttack = (index: number) => {
  if (game.phase !== 'playing') return;
  if (game.currentTurn !== 'player') return;
  if (game.playerAttacks.has(index)) return;
  // ... safe to continue
}
```

**Error 3: Using Array Methods on Sets**
```typescript
// WRONG
if (mySet.includes(value)) { }

// CORRECT
if (mySet.has(value)) { }
```

**Error 4: Ship Wrapping Rows**
```typescript
// WRONG
if (startIndex + length - 1 > 99) return false;

// CORRECT
if (startIndex + length - 1 > 99) return false;
const startRow = Math.floor(startIndex / 10);
const endRow = Math.floor((startIndex + length - 1) / 10);
if (startRow !== endRow) return false;
```

---

## Definition of Done

The implementation is complete when:

- [ ] All 16 files created with exact content
- [ ] All unit tests pass (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Game playable locally (`npm run preview`)
- [ ] Deployed to Netlify
- [ ] Game playable on deployed site
- [ ] README updated with deployment URL
- [ ] No console errors in production
- [ ] All manual testing checklist items verified
- [ ] All acceptance criteria met

---

## Estimated Timeline

- **Core logic:** 2 hours
- **Tests:** 1 hour
- **UI components:** 2 hours
- **Configuration & polish:** 0.5 hours
- **Deployment:** 0.5 hours
- **Total:** 6 hours

---

## Final Instructions

1. Follow this specification exactly
2. Do not make autonomous decisions
3. Do not add features beyond what's specified
4. Do not optimize prematurely
5. Create files in the order specified
6. Run tests after creating game.ts - all must pass before proceeding
7. Verify at each checkpoint
8. If anything is unclear, this specification is incomplete

**This specification is complete. No additional decisions should be required.**

---

**END OF SPECIFICATION**
```