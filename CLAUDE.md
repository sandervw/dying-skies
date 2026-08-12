# CLAUDE.md — Dying Skies (frontend)

## Current Status
- **Phase:** Frontend/visual only. Backend + API contract are out of scope for now.
- **Now:** Centered layout is BUILT in React + TypeScript (strict). `mockups/centered.html` is the design reference. Config: `tsconfig.{json,app,node}`, `vite.config.ts`, `.tsx` entry. Code follows `docs/sparse.React.md` + `docs/Sparse.ts.md`. Structure: `src/components/{Sky,ImmersionToggle,Header,Footer}.tsx`, `src/hooks/{useImmersion,useSkyStats}.ts`, `src/services/skyStats.ts`, `src/types/skyStats.ts`, `src/App.tsx`. Immersive mode = `.immersive` toggled on a wrapper `<div>` from React state. Tagline stats come from `useSkyStats`, which returns `MOCK_SKY_STATS` (TanStack fetch belongs in this hook once the backend exists); `formatCount` adds commas. `npm run build` runs `tsc -b && vite build` and passes clean. Sky is empty black.
- **Next:** Build the falling-star canvas (Canvas 2D) inside `Sky.tsx` via a hook + pure generator services.
- **Design notes:** Load order = sparse.css, then dyingskies.css. `dyingskies.css` holds site components: `.sky`, `.ui` (immersive-hide wrapper), `.header`, `.footer`, `.title`, `.tagline`, `.immersion-toggle`, `.immersive`. The React entry does not yet import either CSS file; wire this before running `dev`. `Sparse.css.md` manifesto names 'copper' (unused).
- **Last updated:** 2026-08-11

> Keep this section current as we go. It's the first thing to read each request.

## What This Is
Procedurally-generated "skies" as falling stars on a black field. Click a falling star → save it + open its sky → infinite traversal. Full concept: `PLAN.md`. One-liner: the sky is the interface; UI is near-invisible.

## Scope & Workflow
- **My job:** commands + code. **Sander drives** — implement small chunks, he reviews.
- This track is **visual/frontend ONLY**. No auth, no real backend calls yet (stub/mock data).

## Stack
- **Vite + React** (NOT Next.js). Rendering: **Canvas 2D** primary; WebGL/Three.js only if effects demand it.
- Everything deterministic-from-seed lives in pure generator functions (constellation, palette, trajectory).

## Design System — Sparse CSS (`sparse.css`)
Utility CSS with hard constraints. **Obey the Laws** (`Sparse.css.md`):
- ≤5 of any variable type; no hardcoded numbers (use CSS vars); rem not em.
- Sizes: `--xsmall/small/medium/large/xlarge`. Percentages only 25/50/75/100.
- Colors: 2 only — `copper` (accent) + `danger`. Text/bg via theme vars.
- ≤2 classes per element; ≤3 'types' per class. One anim speed, one radius, no box-shadows.
- Compose from existing utilities before writing new CSS. Font: `ia-writer-quattro-s`.

## Conventions (Sander's global rules)
- Windows/Linux only (no Mac). Bash over PowerShell. `python` not `python3`. `wc -w` for word counts.
- No em-dashes. Soft-wrap prose. Prefer non-Microsoft tooling.
