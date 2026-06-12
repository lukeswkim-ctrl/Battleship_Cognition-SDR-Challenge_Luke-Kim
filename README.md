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
3. Color key:
   - `bg-blue-900` (navy) = empty water
   - `bg-gray-400` (gray) = your ship
   - `bg-red-500` (red) = hit
   - `bg-blue-300` (light blue) = miss
4. Sink all 5 enemy ships to win

## Game Rules

- 5 ships per player: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Ships are placed horizontally
- Ships cannot be placed horizontally adjacent to each other (left/right gaps required; vertical stacking is allowed)
- Turn-based gameplay
- First to sink all opponent ships wins

## Features

- Color-coded boards (empty / your ship / hit / miss)
- Fleet status panels on each side of the boards with per-ship hit tracking (size, hit %, and Afloat/partial/Sunk state)
- Shot counter and accuracy stats (`Shots / Hits / Accuracy`)
- Hit/miss animations (CSS keyframes: hit pulse, miss fade)
- Color legend below the boards

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
