# Battleship Game

Browser-based Battleship game: Human vs AI

**Live Demo:** (https://battleship-cognition-challenge.netlify.app/)

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
3. Pick a difficulty (Easy / Normal / Hard) before your first shot — it persists across New Game
4. Color key:
   - `bg-blue-900` (navy) = empty water
   - camo (per-ship military shade) = your ship — each of your 5 ships has its own camo color
   - `bg-red-500` (red) = hit
   - `bg-gray-400` (gray) = miss
5. Sink all 5 enemy ships to win

The on-screen legend shows Empty / Hit / Miss (your-ship camo is self-evident on your own board).

## Game Rules

- 5 ships per player: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Ships are placed horizontally
- Ships cannot be placed horizontally adjacent to each other (left/right gaps required; vertical stacking is allowed)
- Turn-based gameplay
- First to sink all opponent ships wins

## Features

- Color-coded boards (empty / hit / miss) with per-ship camo coloring — each of your 5 ships renders in its own unique military camo shade
- Fleet status panels on each side of the boards with per-ship hit tracking (size, hit %, and Afloat/partial/Sunk state)
- Shot counter and accuracy stats (`Shots / Hits / Accuracy`)
- Hit/miss animations (CSS keyframes: hit pulse, miss fade)
- Smart AI with hunt/target mode (after a hit, the AI targets adjacent cells instead of firing randomly)
- Difficulty levels: Easy (pure random), Normal (hunt/target), Hard (hunt/target + collinear targeting)
- Mobile-responsive layout (cells and fonts scale down; the 3-column layout collapses to a single stacked column on narrow screens)
- Color legend (Empty / Hit / Miss) below the boards

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
