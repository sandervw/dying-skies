# Frontend Outline

Vite + React SPA, Canvas 2D.

## Implementation
- Seed-derived Canvas 2D sky: constellation, palette, and falling stars, drawn by `Sky.tsx` via `skyService` and `starService`.
- Routing: `/` (root sky), `/sky/<seed>`, `/gallery`, `/analytics`, all through `routeService` and a catch-all route to `Sky`.
- Session auth: `AuthContext` fetches the current user; `AuthOverlay` hosts `LoginForm`/`SignupForm`; gallery, save, and destroy actions are gated on login.
- Save/destroy flow: backend issues seed/tag batches; `starApiService` calls `/stars/save` and `/stars/destroy`; `DestroyOverlay` confirms destruction.
- Gallery view: fetches the user's saved seeds, renders a mini constellation and wagging star per tile, click opens that sky.
- Counter tagline: `Footer` polls `GET /stats` every 15 seconds for saved, destroyed, and died totals.
- Immersive/fullscreen toggle via `useImmersion`.
- `/analytics` route exists but `AnalyticsView` is still a placeholder ("Analytics coming soon").

## Out of scope
Seed issuance, persistence, auth (backend); the analytics pipeline (analytics).

## Design Concept

Screensaver aesthetic. Very minimal UI.

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

## Counter display
- Homepage tagline shows saved, destroyed, and dead totals.
- The client polls `GET /stats` at a short interval.

## Outstand Items

1. Adjust saved star gallery - outline around each box? Need to make it a clickable/link point when hovering over the comet.
2. Sky music.