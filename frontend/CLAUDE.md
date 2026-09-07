# Dying Skies / frontend

Vite + React single-page app; Canvas 2D visual layer.

## Stack
- React 19 + TypeScript, built with Vite.
- Routing via `react-router-dom`; server data via `@tanstack/react-query`.
- Rendering is Canvas 2D.
- Deployed on Cloudflare with `wrangler`.

## Commands
- `npm run dev`: local dev server.
- `npm run build`: `tsc -b` then `vite build`.
- `npm run typecheck`: `tsc -b`, the check gate.
- `npm run preview`: serve the production build.
- `npm run deploy`: `wrangler deploy` to Cloudflare.

## Backend contract
- The frontend integrates with the backend only through the HTTP API in `backend/.docs_backend/api-contract.md`.
- Auth is session-cookie based.
- Seeds and tags are 32-byte values as unpadded base64url strings.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.

## Music
**Assume the user has ZERO MUSIC KNOWLEDGE**; you must explain music in laymans terms.
