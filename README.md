# Battleship Game

Browser-based Battleship game: Human vs AI

**Live Demo:** [Play Now](https://battleship-cognition-challenge.netlify.app/)

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

1. Click **New Game** to start — ships are randomly placed (both horizontal and vertical orientations)
2. Click cells on the **Enemy Waters** board (right side) to fire
3. Pick a difficulty (**Easy / Normal / Hard**) using the selector below the New Game button. The selector is **locked during an active game** — you can only change it before your first shot or after a game ends. Your difficulty choice persists across sessions.
4. **Status banner** at the top shows: whose turn it is, the last action (with coordinate), and how many enemy ships remain
5. **Hover feedback** on the enemy board:
   - **Amber** text = "Targeting: F6" (un-attacked cell)
   - **Green** text = "Already hit at F6"
   - **Gray** text = "Already missed at F6"
6. Color key (also shown in the on-screen legend):
   - Navy blue = empty water
   - Camo shades = your ships (each ship has a unique camo color)
   - Red = hit
   - Orange with ✕ = sunk ship
   - Gray = miss
7. When you sink a ship, a **green toast** briefly appears ("You sank the enemy Cruiser!")
8. When the AI sinks one of your ships, a **red toast** appears
9. Sink all 5 enemy ships to win — a **Victory modal** shows your stats, accuracy, and mini board previews

## Game Rules

- 5 ships per player: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Ships are placed randomly in both horizontal and vertical orientations
- Ships cannot overlap or extend off the board
- Turn-based gameplay — you fire, then the AI fires
- First to sink all opponent ships wins

## Features

### Core Gameplay
- Color-coded boards (empty / hit / miss / sunk) with per-ship camo coloring
- Fleet status panels with per-ship hit tracking (size, hit %, health bar)
- Shot counter and accuracy stats (`Shots | Hits | Accuracy`)
- Hit/miss point-of-action animations (floating "HIT!" / "MISS" / "SUNK" tags)
- Ship sink toasts (green for player sinks, red for AI sinks)
- Sunk ships display orange cells with ✕ markers

### AI & Difficulty
- Smart AI with hunt/target mode (after a hit, targets adjacent cells)
- **Easy:** pure random targeting
- **Normal:** hunt/target (clusters shots around hits)
- **Hard:** hunt/target + collinear targeting (follows the line of a hit ship)
- Difficulty locked mid-game to prevent unfair switching

### Status & Feedback
- Persistent status banner: current turn, last action with coordinate, enemy ships remaining
- Coordinate labels (A–J columns, 1–10 rows) on both boards
- Hover targeting with color-coded feedback (amber/green/gray)
- Crosshair cursor on targetable enemy cells

### End-Game & Stats
- **Victory/Defeat modal** with accuracy, ships sunk/lost, win streak, and mini board previews
- **Lifetime Stats** panel (Games W-L, accuracy, current streak, best game) — click "Stats" below the difficulty selector
- Stats and difficulty persist across sessions via localStorage
- **Reset Stats** button with confirmation dialog

### Layout & Responsive
- 3-column desktop layout (Your Fleet panel → boards → Enemy Fleet panel)
- Single-column stacked layout on narrow screens
- Board titles left-aligned with column A
- Difficulty selector centered below New Game button

## Known Issues

- ~~**Rapid clicking (Bug 12):**~~ Fixed. A synchronous `useRef` lock now prevents multiple shots from registering during the same turn, regardless of click speed. See `BUG_LOG.md` for the full write-up.

## Project Structure

```
src/
├── lib/              # Core game logic
│   ├── types.ts      # GameState, Difficulty, Player types
│   ├── game.ts       # Ship placement, attack resolution
│   ├── ai.ts         # AI targeting (random, hunt/target, collinear)
│   ├── coords.ts     # Index ↔ coordinate helpers (A1–J10)
│   └── storage.ts    # localStorage persistence (stats, difficulty)
├── components/       # React components
│   ├── Cell.tsx       # Individual board cell with hover/animation
│   ├── Board.tsx      # 10×10 grid with coordinate labels
│   ├── Game.tsx       # Main game controller
│   ├── EndGameModal.tsx   # Victory/Defeat overlay
│   ├── SinkToast.tsx      # Ship-sink notification toasts
│   └── StatsPanel.tsx     # Lifetime stats panel
└── App.tsx
```
