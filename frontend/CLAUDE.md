# CLAUDE.md: Dying Skies / frontend

Vite + React SPA, Canvas 2D visual layer. Outline: `.docs_frontend/outline.md`. Standards and system conventions live in the root `CLAUDE.md`; this file adds only frontend specifics.

## Status
Phase 1 (core experience), frontend-only. Backend and auth are out of scope; data is stubbed or session-local until the backend exists.

## Stack notes
- Rendering: Canvas 2D primary; WebGL or Three.js only if effects demand it.
- Seed-derived logic (constellation, palette, trajectory, pixel arrangement) lives in pure generator functions.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
