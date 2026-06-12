# Bug Log

This log records issues found and fixed while implementing the spec and the
post-spec feature work. The implementation follows `FINAL_BATTLESHIP_SPEC.md`
exactly; the entries below are the gaps/defects/decisions that surfaced during
build-out, plus how each was resolved.

Every entry uses the same attributes: **Phase, Severity, Symptom, Fix, Caught
at, Result.**

**Severity scale**

- **P0 — Critical:** Game is broken or unplayable
- **P1 — High:** Major feature is wrong or data is incorrect
- **P2 — Medium:** Minor feature broken or visual/config defect
- **P3 — Low:** Cosmetic issue or non-blocking inconsistency

---

## Bug 1 — Missing `jsdom` dependency for the configured test environment

- **Phase:** 2 (Testing)
- **Severity:** P1 — High (the entire test suite cannot run)
- **Symptom:** `vite.config.ts` sets `test.environment: 'jsdom'`, but the spec's
  `devDependencies` list does not include `jsdom`. Vitest loads the configured
  environment at startup, so `npm test` would fail with a "Cannot find package
  'jsdom'" error before any test ran.
- **Fix:** Added `"jsdom": "^24.0.0"` to `devDependencies`.
- **Caught at:** First `npm test` run during the Phase 2 gate.
- **Result:** `npm test` runs; all 30 tests pass.

---

## Bug 2 — `test` field not typed on Vite's `defineConfig`

- **Phase:** 2 / 4 (Config)
- **Severity:** P2 — Medium (config typecheck error, no runtime impact)
- **Symptom:** The spec's `vite.config.ts` passes a `test` property to Vite's
  `defineConfig`. Vite's own config type does not include `test`, so the file is
  a TypeScript error under `strict` unless Vitest's types are referenced.
- **Fix:** Added `/// <reference types="vitest" />` at the top of
  `vite.config.ts` so the `test` block is typed by Vitest.
- **Caught at:** `npx tsc --noEmit` while wiring up the test config.
- **Result:** Config typechecks; no change to runtime behavior.

---

## Bug 3 — Config files required before the Phase 2 "hard gate"

- **Phase:** 2 (Testing)
- **Severity:** P2 — Medium (process/ordering blocker, no code defect)
- **Symptom:** The spec orders config under Phase 4, but `npm test` cannot run
  without `package.json`, `vite.config.ts`, and `tsconfig*.json`. The Phase 2
  gate ("all tests must pass before Phase 3") is therefore impossible without
  some Phase 4 files present.
- **Fix:** Created the minimum config needed to run Vitest during Phase 2
  (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`).
  Remaining config (`tailwind.config.js`, `postcss.config.js`, `netlify.toml`,
  `index.html`, `src/main.tsx`) was added in Phase 4 as specified.
- **Caught at:** Attempting to run `npm test` for the Phase 2 gate.
- **Result:** Phase 2 gate satisfied without deviating from spec file contents.

---

## Bug 4 — Missing `tsconfig.node.json` referenced by `tsconfig.json`

- **Phase:** 4 (Config)
- **Severity:** P2 — Medium (TypeScript configuration error)
- **Symptom:** The spec's `tsconfig.json` declares
  `"references": [{ "path": "./tsconfig.node.json" }]`, but the spec does not
  provide that file's contents. A missing referenced project causes a TypeScript
  configuration error.
- **Fix:** Added a standard Vite `tsconfig.node.json` (composite, includes
  `vite.config.ts`).
- **Caught at:** `npx tsc --noEmit` and `npm run build` in Phase 4.
- **Result:** `npx tsc --noEmit` and `npm run build` (`tsc && vite build`) both
  succeed with no errors.

---

## Bug 5 — Per-ship state duplicated after `Set<number>[]` refactor

- **Phase:** Post-spec feature work (per-ship size + hit% panels)
- **Severity:** P3 — Low (dead/duplicate state, no user-facing effect)
- **Symptom:** A prior feature added `playerFleet`/`aiFleet: number[][]` to
  `GameState` to hold per-ship segments. The refactor changing
  `playerShips`/`aiShips` to `Set<number>[]` makes those arrays hold the same
  per-ship data, so `playerFleet`/`aiFleet` became redundant.
- **Fix:** Removed `playerFleet`/`aiFleet` from `types.ts` and `initializeGame()`;
  the fleet panels now read per-ship data directly from `playerShips`/`aiShips`.
- **Caught at:** During the `types.ts`/`game.ts` edit, before the first typecheck.
- **Result:** Single source of truth for ships; `tsc` clean.

---

## Bug 6 — Spec assumed `getAIMove(playerShips)`, actual signature differed

- **Phase:** Post-spec feature work (`Set<number>[]` refactor)
- **Severity:** P3 — Low (documentation/assumption mismatch, no code defect)
- **Symptom:** The task asked to update `getAIMove()` to receive
  `playerShips: Set<number>[]` and update its hit-detection. At that time the
  actual `getAIMove(previousAttacks: Set<number>)` only picked a random
  unattacked cell and never received or inspected ships — hit detection lived in
  `Game.tsx`.
- **Fix:** No change to `ai.ts` then; the ship-membership updates were applied at
  the real call sites in `Game.tsx` (`game.playerShips.some(s => s.has(i))`).
  (This was later revisited when smart AI was implemented — see Bug 8.)
- **Caught at:** Reviewing `ai.ts` before editing.
- **Result:** No defect; `ai.ts` left unchanged intentionally at that stage.

---

## Bug 7 — Flat-Set call sites would break under `Set<number>[]`

- **Phase:** Post-spec feature work (`Set<number>[]` refactor)
- **Severity:** P1 — High (compile + runtime breakage if shipped partial)
- **Symptom:** Membership/size call sites assumed a flat `Set<number>`:
  `Board.tsx` used `ships.has(index)`; `Game.tsx` used `game.aiShips.has(...)`
  and `game.playerShips.has(...)`; tests used `placeAllShips().size` and
  `initializeGame().playerShips.size`. All of these are invalid on an array of
  Sets (`.has` is not an array method; `.size` is `undefined`).
- **Fix:** Updated every call site in the same commit: `.has(i)` →
  `.some(ship => ship.has(i))`, `isAllShipsSunk` now takes `Set<number>[]`, and
  tests assert `toHaveLength(5)` + summed `.size === 17`.
- **Caught at:** Anticipated and fixed proactively; the first `npx tsc --noEmit`
  and `npm test` after the refactor passed with no errors.
- **Result:** `tsc` clean, all tests pass — no partial-refactor failures observed.

---

## Bug 8 — `getAIMove()` needed `playerShips`/`difficulty` for hunt/target AI

- **Phase:** Smart AI / difficulty (PR #3, features 5–6)
- **Severity:** P2 — Medium (feature could not work without a signature change)
- **Symptom:** Hunt/target and difficulty logic require `getAIMove()` to know
  which cells are ships and which difficulty is active, but the function still
  took only `previousAttacks` (the gap noted in Bug 6) and the call site passed
  nothing else.
- **Fix:** Extended the signature to
  `getAIMove(previousAttacks, playerShips: Set<number>[] = [], difficulty = 'normal')`
  with the hunt/target + collinear logic; updated the call site to
  `getAIMove(game.aiAttacks, game.playerShips, difficulty)`. Defaults keep the
  existing 4 `getAIMove` tests valid.
- **Caught at:** Implementing feature 5; verified by new hunt/target unit tests.
- **Result:** 41/41 tests pass; AI clusters shots around confirmed hits.

---

## Bug 9 — `difficulty` split between `GameState` and React state

- **Phase:** Difficulty levels (PR #3, feature 6)
- **Severity:** P3 — Low (risk of two sources of truth drifting)
- **Symptom:** The spec asks to add `difficulty` to `GameState` (default
  `'normal'`) AND keep a separate React `difficulty` state for the selector,
  which could let the displayed difficulty and the difficulty used by the AI
  diverge.
- **Fix:** Made the React `difficulty` state the single UI source of truth; it is
  passed into `initializeGame(difficulty)` and `getAIMove(..., difficulty)`, so
  `GameState.difficulty` always mirrors the selected value. New Game reuses the
  current React state instead of resetting to `'normal'`.
- **Caught at:** Wiring the selector and the New Game handler.
- **Result:** Selected difficulty persists across New Game; values never drift.

---

## Bug 10 — `Cell` lacked ship identity needed for per-ship camo colors

- **Phase:** Per-ship camo coloring (PR #3 follow-up)
- **Severity:** P2 — Medium (visual feature could not distinguish ships)
- **Symptom:** `Cell` only received `state` (`empty`/`ship`/`hit`/`miss`), so it
  could not tell which ship a `ship` cell belonged to — every ship would share
  one camo color.
- **Fix:** Added an optional `shipIndex` prop to `Cell`, computed in `Board` via
  `ships.findIndex(s => s.has(index))`; `Cell` applies `cell-camo cell-camo-{i}`
  for `ship` cells. `shipIndex` is ignored for non-ship states and on the enemy
  board (ships render as `empty` there), so no ship positions leak.
- **Caught at:** Implementing the unique-shade camo feature.
- **Result:** Each of the 5 ships renders a distinct camo shade; `tsc`/tests clean.

---

## Bug 11 — Difficulty was changeable during an active game

- **Phase:** Difficulty selector UX (PR #5)
- **Severity:** P2 — Medium (gameplay-fairness defect: AI behavior could be swapped mid-match)
- **Symptom:** The difficulty toggles stayed clickable after the player's first
  shot, so the active difficulty (and therefore the AI's targeting behavior)
  could be changed in the middle of a game. The selected difficulty is read on
  every AI turn, so switching mid-game would alter the opponent's strategy
  partway through a match.
- **Fix:** Gated the toggles with
  `canChooseDifficulty = game.phase === 'ended' || game.playerAttacks.size === 0`
  and applied `disabled={!canChooseDifficulty}` (plus `disabled:opacity-50
  disabled:cursor-not-allowed`). The selector stays visible so the current
  difficulty is shown, but is only interactive before the first shot or after a
  game ends.
- **Caught at:** Reported during PR #5 review; confirmed fixed in the
  comprehensive end-to-end test (toggles greyed out and non-clickable after the
  first shot, re-enabled on New Game / game end).
- **Result:** Difficulty cannot change once a game is underway; `tsc`/tests clean.

---

## Verification

- `npm test` → 41/41 passing
- `npx tsc --noEmit` → no errors
- `npm run build` → succeeds; JS bundle ~48 KB gzipped (target < 300 KB)

### Comprehensive end-to-end test (PR #5)

A full manual playthrough on the dev server (8 scenarios) passed with **no new
defects** found:

1. Ship placement & per-ship camo — 17 ship cells render in distinct camo
   shades; enemy ships hidden.
2. Hit/miss colors, fleet % panels, and the `Shots / Hits / Accuracy` stats bar
   all update correctly (hit = red, miss = gray).
3. Difficulty selector — selectable before the first shot, locked during play,
   persists across New Game (see Bug 11).
4. Turn locking — board clicks during the AI's turn are ignored (shot count does
   not advance; all cells disabled).
5. AI hunt/target — after a hit the AI's follow-up shots cluster on adjacent
   cells (Normal/Hard) instead of scattering randomly.
6. Player win detection — sinking all 5 enemy ships shows
   "You win! All enemy ships destroyed." and re-enables the difficulty selector.
7. New Game reset — `Shots/Hits/Accuracy` → 0, enemy ships hidden again, fresh
   placement, difficulty preserved.
8. Responsive layout — the 3-column layout collapses to a single stacked column
   on narrow screens and cells/fonts scale down.
