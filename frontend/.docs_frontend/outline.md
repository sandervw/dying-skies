# Frontend Outline

Vite + React SPA, Canvas 2D.

## TODO - Outline

TODO - project details

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
2. Delete sky functionality.
3. Sharing Fuctionality?
4. Sky music.