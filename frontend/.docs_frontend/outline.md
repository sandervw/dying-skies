# Frontend Outline

Vite + React single-page app rendering procedural skies on a Canvas 2D layer.

## Layout (`src/`)
- `components/`: `Sky` (the canvas view), `Header`, `Footer`, `ButtonBox`, `GalleryView`, `AuthOverlay` with `LoginForm`/`SignupForm`, `DestroyOverlay`, `Icon`.
- `contexts/`: `SkySeedContext` (route seed plus save/destroy), `AuthContext` (current user).
- `hooks/`: `useSkySeed`, `useSkyCanvas`, `useStats`, `useAuth`, `useImmersion`, `useSkyMusic`.
- `services/`: `skyService`, `starService`, `paletteService`, `randomService` (pure seed-derived generators); `musicService` (score building and playback through `webmusic-engine`); `starApiService`, `authService` (backend calls); `routeService`, `iconService`, `manualEntryGuards`.
- `utils/`: `instrumentSets`, `modes`, `presets` (the music catalogs).
- `types/`: `sky`, `star`, `palette`, `auth`, `music`.
- `labs/`: `MusicLab` and `PaletteLab`, developer pages served from `lab.html`.
- `App.tsx`, `main.tsx`: app shell and mount.

## Rendering
- Seed-derived Canvas 2D sky. `Sky.tsx` paints the constellation, palette, and falling stars through `useSkyCanvas`, `skyService`, and `starService`.
- All seed-derived logic (constellation, palette, trajectory, pixel arrangement) lives in pure generator functions; a seed renders the same static art each time.

## Routing
- `/` root sky; `/sky/<seed>` individual sky; `/gallery` saved skies. A catch-all route falls back to `Sky`, all resolved through `routeService`.
- The analytics button leaves the SPA and links to the external analytics site.

## Auth
- `AuthContext` fetches the current user via `authService`.
- `AuthOverlay` hosts `LoginForm` and `SignupForm`.
- Gallery, save, and destroy actions are gated on login.

## Save and destroy
- The backend issues seed/tag batches. `starApiService` calls `/stars/save` and `/stars/destroy`.
- `DestroyOverlay` confirms destruction before the call.

## Gallery
- Fetches the user's saved seeds, renders a mini constellation and one wagging star per tile; clicking a tile opens that sky.

## Music
- `useSkyMusic` plays each seed through `musicService`: the seed picks an instrument set, a preset, and a mode, and `Header` shows them under the title.
- The score is an 8-bar loop per instrument role. Each repeat re-rolls a fifth of its notes.
- Music starts muted. `webmusic-engine` downloads on the first unmute.
- On phones a silent looping clip keeps a locked phone playing and shows lock-screen controls.

## Counter
- `Footer` polls `GET /stats` every 15 seconds and shows saved, destroyed, and died totals.

## Design concept
Screensaver aesthetic; the sky is the interface and UI stays near-invisible.

- Pitch-black background.
- Static per seed: a few scattered white dots; one connect-the-dots constellation (shape, position, star count); a falling-star color palette.
- Dynamic per session: falling stars, each a fixed pixel arrangement colored from the palette.
- Reopening a seed shows the same static art with fresh falling stars.

## Root sky
- Fixed hardcoded seed: the origin of the universe.
- Anyone can fall from sky to sky. Saving, destroying, and the gallery need a login.

## Seeds
- A seed is an unpadded base64url string (~43 chars) and is shareable as a `/sky/<seed>` link.

## Page load
- `public/_headers` caches the fingerprinted `/assets/*` files for a year; the HTML revalidates on every visit.
- The Silkscreen title font ships with the app from `@fontsource/silkscreen` and is preloaded in `index.html`.
- `index.html` preconnects to the API.

## Boundaries
Seed issuance, persistence, and auth are the backend's; the analytics pipeline is its own deployed site. The frontend integrates with the backend only through the HTTP API in `backend/.docs_backend/api-contract.md`.
