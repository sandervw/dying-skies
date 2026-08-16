# CLAUDE.md — Dying Skies / frontend

Vite + React visual layer. Canvas 2D falling stars on a black field. Concept:
`../docs/PLAN.md`.

## Current Status
- **Phase:** Frontend/visual only. Backend + API contract out of scope.
- **Done:** Canvas 2D falling stars (rAF loop, wagging pixel tails, hit
  testing, hover freeze + pointer cursor, click-to-transition seed). URL-driven
  seed routing: `/` root sky, `/sky/<base64url>` per-sky, browser back/forward
  via History API (`routeService` + `useSeedRoute`).
- **Next:** Session-local saved/dead star counters (persist across reloads).

Keep this section current. It's the first thing to read each request.

## Stack
- Vite + React. Rendering: Canvas 2D primary; WebGL/Three.js only if effects
  demand it.
- Deterministic-from-seed logic lives in pure generator functions
  (constellation, palette, trajectory).
- Stub/mock data only. No auth, no real backend calls yet.

## Code Conventions
- Full descriptive names; exceptions are `id`, `url`, `api`.
- CSS: refer to `docs/Sparse.css.md`
- React: refer to `docs/sparse.React.md`
- TypeScript: refer to `docs/Sparse.ts.md`
