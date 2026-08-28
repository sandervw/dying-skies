# CLAUDE.md: Dying Skies / frontend

Vite + React single-page app; Canvas 2D visual layer. Standards and system conventions live in the root `CLAUDE.md`; this file adds only frontend specifics.

## Stack
- React 19 + TypeScript, built with Vite.
- Routing via `react-router-dom`; server data via `@tanstack/react-query`.
- Rendering is Canvas 2D. Seed-derived logic (constellation, palette, trajectory, pixel arrangement) lives in pure generator functions.
- Deployed on Cloudflare with `wrangler`.

## Layout orientation
- `src/components/` view and overlay components; `src/contexts/` (`SkySeedContext`, `AuthContext`); `src/hooks/`; `src/services/` (pure generators plus backend clients); `src/types/`.
- Full map and behavior in `.docs_frontend/outline.md`.

## Commands
- `npm run dev`: local dev server.
- `npm run build`: `tsc -b` then `vite build`.
- `npm run typecheck`: `tsc -b`, the check gate.
- `npm run preview`: serve the production build.
- `npm run deploy`: `wrangler deploy` to Cloudflare.

## Backend contract
- The frontend integrates with the backend only through the HTTP API in `backend/.docs_backend/api-contract.md`; treat it as frozen.
- Used endpoints: `POST /stars/batch`, `POST /stars/save`, `POST /stars/destroy`, `GET /stars/mine`, `GET /stats`, and `/auth/*` (`signup-riddle`, `password/check`, `signup`, `login`, `logout`, `me`).
- Auth is session-cookie based. Send requests with credentials so the httponly `session_id` cookie travels.
- Seeds and tags are 32-byte values as unpadded base64url strings. Business-logic errors use `{error, code}`; malformed requests return FastAPI's `{detail: [...]}` at 422.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
