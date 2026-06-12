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

## Verification

- `npm test` → 30/30 passing
- `npx tsc --noEmit` → no errors
- `npm run build` → succeeds; JS bundle ~47 KB gzipped (target < 300 KB)
