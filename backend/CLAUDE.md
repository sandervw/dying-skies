# CLAUDE.md: Dying Skies / backend

FastAPI + Postgres API. Standards and system conventions live in the root `CLAUDE.md`; this file adds only backend specifics.

## Stack notes
- Python with FastAPI; Postgres storage.
- Issues stars and verifies saves via HMAC; exposes stats and sky endpoints. Details in the plan.

## Code layout
- Exception to one-export-per-file: small domain modules (`security.py`, `session.py`, `db.py`, `encoding.py`) may group tightly-related functions.

## Prose
Soft-wrap paragraphs and list items (one physical line each). No em-dashes.
