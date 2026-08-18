# Frontend Plan

Vite + React SPA, Canvas 2D. Concept: `../../.docs/plan.md`.

## Scope
- Render loop for falling stars: tail wag, hit detection, hover freeze, click traversal.
- Seed-to-sky generation in pure functions: constellation, palette, trajectory, per-star pixel arrangement.
- Routing, interaction, counter display, saved-skies browsing.
- Consumes the backend API for seed issuance, saves, and counters.

## Stage 1: Seed-derived sky generation - DONE
`skyService.ts` builds the static dot field and constellation (MST plus a few loop edges). `paletteService.ts` builds an analogous HSL palette. `starService.ts` derives fall angle and per-star comet pixel arrangement. All pure, all deterministic from seed via `deriveSeed` domain-splitting in `randomService.ts`. Runs on today's 32-bit seed (see Stage 4).

## Stage 2: Falling star render loop and interaction - DONE
`useStarField.ts` drives a `requestAnimationFrame` loop: spawns, advances, and culls stars; tail wag via `tailWave`; hover detection freezes the hovered star (`findStarAtCoordinates`, `frozenStarId`); click calls `onSelectStar` to traverse into that star's seed.

## Stage 3: Routing - DONE
`useSeedRoute.ts` reads/writes `/`, `/sky/<seed>`, and `/analytics` via the native History API (`routeService.ts`), no router library. All routes work, including back/forward. `/analytics` renders `AnalyticsView`, a placeholder pending the analytics piece.

## Stage 4: 256-bit seeds - DONE
`Seed` is a 32-byte `number[]` (`randomService.ts`), fed through `hashSeedBytes` before `deriveSeed`'s domain-split avalanche mix. `routeService.ts` codes seeds as raw base64url bytes (~43 chars); `ROOT_SEED` is a 32-byte literal. Every seed-typed call site (`starService.ts`, `skyService.ts`, hooks, `Sky`/`StarField`) now uses `Seed`.

## Stage 5: Counter display - DONE
Footer renders the saved/destroyed/died tagline (`Footer.tsx`, `statService.ts`). `useStats.ts` polls `GET /counters` every 15s via TanStack Query (`QueryClientProvider` in `main.tsx`); `toStats` maps `Counters` to `Stats`, falling back to `MOCK_STATS` while loading or on error.

## Stage 6: Auth and access control - TODO
Add login/signup UI, auth state, and wiring to the backend `/auth/*` endpoints. Saving requires login. Anonymous visitors get a view-only screensaver on every sky; login unlocks click-to-save-and-traverse. Seed issuance and rendering stay anonymous. `StarField` currently always wires `onSelectStar`; gate it on auth. Blocked on backend auth Stage 1.

## Stage 7: Saved skies gallery and backend integration - TODO
No gallery component, no save action, no API service file, and no `fetch` calls anywhere in `src/`. Add an API service, a save action calling `POST /stars/save` (login required), and a gallery reading `GET /stars/mine`. Browsing/sorting UX is still undecided (see Scope below). Blocked on backend auth Stage 2.

## Sky composition
- Pitch-black background.
- Static per seed: a few scattered white dots; one connect-the-dots constellation (shape, position, star count); a color palette for falling stars.
- Dynamic per session: falling stars, each a fixed pixel arrangement colored from the palette.
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
- The client polls `GET /counters` at a short interval.

## Saved skies gallery
How users browse saved skies (thumbnail constellation renders or seed list) and sort or filter options are TBD.

## Out of scope
Seed issuance, persistence, auth (backend); the analytics pipeline (analytics).
