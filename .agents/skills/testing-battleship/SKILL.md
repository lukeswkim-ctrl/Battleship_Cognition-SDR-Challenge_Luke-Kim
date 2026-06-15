---
name: testing-battleship
description: End-to-end test the browser Battleship game (Human vs AI) — board interactions, hit/miss colors, win detection, difficulty selector, hunt/target AI, and responsive layout. Use when verifying UI or gameplay changes to this repo.
---

# Testing the Battleship game

Browser-based Battleship (React + Vite + Tailwind, TypeScript). No backend, no auth — everything runs client-side. Boards are flat indices 0–99 (10x10); per-ship state is `Set<number>[]`.

## Run the app
- `cd` to the repo, `npm install` if needed, then `npm run dev` (Vite serves at http://localhost:5173/).
- Verify logic non-visually first: `npm test` (Vitest), `npx tsc --noEmit`, `npm run build`. These are fast and catch most regressions before any browser work.
- There is **no CI test job** — only a Netlify deploy preview runs on PRs. So local `npm test` is the source of truth for unit tests. Each PR gets a preview at `https://deploy-preview-<N>--battleship-cognition-challenge.netlify.app`.

## Browser testing tips
- Maximize the window before recording: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz` (install wmctrl if missing).
- The `computer` tool click action is `left_click` with `coordinate: [x, y]` — there is **no `click` action and devinid-based clicking is not supported**; click by pixel coordinate.
- Layout: left = "Your Fleet" board (your ships shown, disabled), right = "Enemy Waters" board (click to attack). Fleet status panels sit left/right of the boards on wide screens.
- After each player shot the AI takes a turn after ~600ms; the board is disabled during the AI turn. Put a `wait` of ~1.5–2s between clicks or extra clicks during the AI turn are silently dropped (watch the "Shots" counter to confirm a click registered).

## Feature-specific checks
- **Difficulty selector** (`Game.tsx`): visible only when `phase==='ended'` OR `playerAttacks.size===0`. Active option = `bg-emerald-600` (green), inactive = gray. It is intentionally hidden once play starts and reappears after New Game / game end. Difficulty persists across New Game (does NOT reset to Normal).
- **Hunt/target AI** (`ai.ts`): hardest to demo. Keep clicking distinct enemy cells to advance turns until the AI lands a hit on your fleet (red cell on the left board). The proof is the AI's *next* shots landing orthogonally adjacent to the hit — a contiguous run of red/blue cells, not random scatter. A ship's % in the "Your Fleet" panel jumping (e.g. Carrier 60%) confirms consecutive hits. Hit chance per shot is ~17%, so it can take several turns; be patient. Normal and Hard look identical in the UI (Hard's collinear preference only shows when 2+ cells of one ship are already hit) — demo on Normal for simplicity and rely on unit tests for Hard's collinearity.
- **Responsive layout** (`Cell.tsx`, `Game.tsx`): resize the window narrow with `wmctrl -r :ACTIVE: -e 0,40,0,420,860` (after removing maximized state). At ~400px the 3-column layout collapses to one vertical column: fleet panels and both boards stack, cells shrink (`w-7` vs `md:w-11`). Scroll down to capture the stacked boards. Re-maximize to confirm the 3-column layout restores.

## Manual checklist gotchas (turn-lock, visibility, rapid-click, reset)
- **Turn locking during the AI delay:** the default ~600ms AI window is too short to reliably click inside and screenshot. Temporarily bump the `setTimeout(..., 600)` in `Game.tsx`'s `useEffect` to e.g. `8000` so you can click several cells during the lock and confirm `Shots` does not increase and every cell shows `disabled`. Revert with `git checkout src/components/Game.tsx`.
- **Rapid/duplicate clicks:** double-clicking a fresh cell registers exactly one attack (after the first click the board disables, so the second is dropped) — `Shots` goes +1, not +2. Re-clicking an already-attacked cell is a no-op (guard `playerAttacks.has(index)`); it must NOT pass the turn to the AI.
- **Enemy ship reveal at game end:** `showShips={game.phase==='ended'}`. A **player win turns every enemy ship cell red**, so reveal shows nothing new — you only see camo cells appear if the game ends with *unhit* enemy cells, i.e. an **AI win**. Fastest way to force an AI win for testing: temporarily (a) lower the AI delay to ~300ms and (b) replace the `getAIMove(...)` result with the first unhit player-ship cell (loop `game.playerShips`), so the AI hits every turn — then click ~17 enemy cells to advance turns. Revert afterward. `getCellState` (`Board.tsx`): attacked+ship→`hit` (red), attacked→`miss` (gray), `showShips&&ship`→`ship` (camo), else navy.
- **Layout shift after the first shot:** the Difficulty selector is shown while `playerAttacks.size===0` and disappears after the first shot, shifting the boards UP by ~one row. Click one cell first, then re-screenshot to re-measure cell coordinates before batching more clicks — otherwise later clicks miss the board.
- **New Game reset:** `Shots/Hits/Accuracy` → 0, message back to "Your turn…", enemy board all navy (ships hidden again), a different camo placement on the left board, and the difficulty selection persists.

## Reporting
- Post ONE PR comment with results; use `<details>` blocks and pre-expand the most important test. Embed screenshots via local paths in `![alt](/abs/path.png)` — git_comment_on_pr uploads them automatically.
- Attach the screen recording to the user message (not the PR comment — local mp4 links are rejected by the comment tool).

## Devin Secrets Needed
None — the app is fully client-side with no auth or external services.
