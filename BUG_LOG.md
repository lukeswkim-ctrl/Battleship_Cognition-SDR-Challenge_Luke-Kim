# Bug Log

This log records issues found and fixed while implementing the spec. The
implementation follows `FINAL_BATTLESHIP_SPEC.md` exactly; the entries below are
the gaps/defects that surfaced during build-out, plus how each was resolved.

---

## Bug 1 — Missing `jsdom` dependency for the configured test environment

- **Phase:** 2 (Testing)
- **Symptom:** `vite.config.ts` sets `test.environment: 'jsdom'`, but the spec's
  `devDependencies` list does not include `jsdom`. Vitest loads the configured
  environment at startup, so `npm test` would fail with a "Cannot find package
  'jsdom'" error before any test ran.
- **Fix:** Added `"jsdom": "^24.0.0"` to `devDependencies`.
- **Result:** `npm test` runs; all 30 tests pass.

---

## Bug 2 — `test` field not typed on Vite's `defineConfig`

- **Phase:** 2 / 4 (Config)
- **Symptom:** The spec's `vite.config.ts` passes a `test` property to Vite's
  `defineConfig`. Vite's own config type does not include `test`, so the file is
  a TypeScript error under `strict` unless Vitest's types are referenced.
- **Fix:** Added `/// <reference types="vitest" />` at the top of
  `vite.config.ts` so the `test` block is typed by Vitest.
- **Result:** Config typechecks; no change to runtime behavior.

---

## Bug 3 — Config files required before the Phase 2 "hard gate"

- **Phase:** 2 (Testing)
- **Symptom:** The spec orders config under Phase 4, but `npm test` cannot run
  without `package.json`, `vite.config.ts`, and `tsconfig*.json`. The Phase 2
  gate ("all tests must pass before Phase 3") is therefore impossible without
  some Phase 4 files present.
- **Fix:** Created the minimum config needed to run Vitest during Phase 2
  (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`).
  Remaining config (`tailwind.config.js`, `postcss.config.js`, `netlify.toml`,
  `index.html`, `src/main.tsx`) was added in Phase 4 as specified.
- **Result:** Phase 2 gate satisfied without deviating from spec file contents.

---

## Bug 4 — Missing `tsconfig.node.json` referenced by `tsconfig.json`

- **Phase:** 4 (Config)
- **Symptom:** The spec's `tsconfig.json` declares
  `"references": [{ "path": "./tsconfig.node.json" }]`, but the spec does not
  provide that file's contents. A missing referenced project causes a TypeScript
  configuration error.
- **Fix:** Added a standard Vite `tsconfig.node.json` (composite, includes
  `vite.config.ts`).
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

## Bug 6 — Spec assumed `getAIMove(playerShips)`, actual signature differs

- **Phase:** Post-spec feature work (`Set<number>[]` refactor)
- **Severity:** P3 — Low (documentation/assumption mismatch, no code defect)
- **Symptom:** The task asked to update `getAIMove()` to receive
  `playerShips: Set<number>[]` and update its hit-detection. The actual
  `getAIMove(previousAttacks: Set<number>)` only picks a random unattacked cell
  and never receives or inspects ships — hit detection lives in `Game.tsx`.
- **Fix:** No change to `ai.ts`; the ship-membership updates were applied at the
  real call sites in `Game.tsx` (`game.playerShips.some(s => s.has(i))`).
- **Caught at:** Reviewing `ai.ts` before editing.
- **Result:** No defect; `ai.ts` left unchanged intentionally.

---

## Bug 7 — Flat-Set call sites would break under `Set<number>[]`

- **Phase:** Post-spec feature work (`Set<number>[]` refactor)
- **Severity:** P1 — High (would be compile + runtime breakage if shipped partial)
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

## Verification

- `npm test` → 35/35 passing
- `npx tsc --noEmit` → no errors
- `npm run build` → succeeds; JS bundle ~48 KB gzipped (target < 300 KB)
