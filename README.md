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
