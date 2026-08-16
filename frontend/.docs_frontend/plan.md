# Frontend Plan

Vite + React SPA, Canvas 2D. Concept: `../../.docs/plan.md`.

## Scope
- Render loop for falling stars: tail wag, hit detection, hover freeze, click
  traversal.
- Seed-to-sky generation in pure functions: constellation, palette, trajectory,
  per-star pixel arrangement.
- Routing, interaction, counter display, saved-skies browsing.
- Consumes the backend API for seed issuance, saves, and counters.

## Sky composition
- Pitch-black background.
- Static per seed: a few scattered white dots; one connect-the-dots
  constellation (shape, position, star count); a color palette for falling stars.
- Dynamic per session: falling stars, each a fixed pixel arrangement colored from
  the palette.
- A seed reopened shows the same static art with new falling stars.

## Root sky
- Fixed hardcoded seed (Sander picks it): the origin of the universe.
- Anonymous visitors: view-only screensaver, nothing clickable.
- Logged-in users: full interactive traversal and saving.

## Routes
- `/` root sky, with the global counter tagline.
- `/sky/<seed>` individual sky; seed is base64url (~43 chars), shareable.
- `/analytics` renders the analytics visualizations.

## Design
Screensaver aesthetic. Very minimal UI.

## Counter display
- Homepage tagline shows saved, destroyed, and dead totals.
- Real-time refresh transport (polling or SSE) is TBD.

## Saved skies gallery
How users browse saved skies (thumbnail constellation renders or seed list) and
sort or filter options are TBD.

## Out of scope
Seed issuance, persistence, auth (backend); the analytics pipeline (analytics).
