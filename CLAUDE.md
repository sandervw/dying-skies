# CLAUDE.md — Dying Skies (frontend)

## Current Status
- **Phase:** Frontend/visual only. Backend + API contract are out of scope for now.
- **Now:** Home layout LOCKED: "centered", in `mockups/centered.html` (only mockup left). No inline styles, only `sparse.css` + `dyingskies.css` classes, max 2 classes/element: fully Sparse-law compliant. Custom count colors (bronze/red) REMOVED; tagline counts are now plain grey (inherit `.tagline`). `dyingskies.css` is now all-neutral (no color-law break). Bottom-right "fullscreen" toggle adds `.immersive`, hides `.ui`, fades toggle. Sky still empty black. React `App.jsx` still returns `null`.
- **Next (PAUSED 2026-08-11, resume here):** 1) Build the centered layout into the React app as components. 2) Then build the falling-star canvas.
- **Design notes:** Load order = sparse.css, then dyingskies.css. `dyingskies.css` holds site components: `.sky`, `.ui` (immersive-hide wrapper), `.header`, `.footer`, `.title`, `.tagline`, `.fs-toggle`, `.immersive`. `Sparse.css.md` manifesto still names 'copper' (now unused; flagged).
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
