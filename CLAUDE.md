# CLAUDE.md — Dying Skies (frontend)

## Current Status
- **Phase:** Frontend/visual only. Backend + API contract are out of scope for now.
- **Done:** Canvas 2D falling stars (rAF loop, wagging pixel tails, hit testing, hover freeze + pointer cursor, click-to-transition seed).
- **Next:** URL-driven seed routing / browser history and session-local saved/dead star counters.

> Keep this section current as we go. It's the first thing to read each request.

## What This Is
Procedurally-generated "skies" as falling stars on a black field. Click a falling star → save it + open its sky → infinite traversal. Full concept: `PLAN.md`. One-liner: the sky is the interface; UI is near-invisible.

## Scope & Workflow
- **My job:** commands + code. **Sander drives** — implement small chunks, he reviews.
- This track is **visual/frontend ONLY**. No auth, no real backend calls yet (stub/mock data).

## Stack
- **Vite + React** (NOT Next.js). Rendering: **Canvas 2D** primary; WebGL/Three.js only if effects demand it.
- Everything deterministic-from-seed lives in pure generator functions (constellation, palette, trajectory).

## System Conventions
- Windows/Linux only (no Mac). Bash over PowerShell. `python` not `python3`. `wc -w` for word counts.
- No em-dashes. Soft-wrap prose. Prefer non-Microsoft tooling.

## Code Conventions
- Use **Full descriptive names** over abbreviations or acronyms.
  - `userAuthentication` beats `usrAuth` or `ua`.
  - **Exception:** universally understood abbreviations (`id`, `url`, `api`).
- When writing or editing **CSS**, always refer to `docs\Sparse.css.md`
- When writing or editing **React**, always refer to `docs\Sparse.React.md`
- When writing or editing **Typescript**, always refer to `docs\Sparse.ts.md`