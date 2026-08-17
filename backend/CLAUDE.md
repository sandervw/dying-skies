# CLAUDE.md: Dying Skies / backend

FastAPI + Postgres API. Plan: `.docs_backend/plan.md`. Standards and system conventions live in the root `CLAUDE.md`; this file adds only backend specifics.

## Stack notes
- Python with FastAPI; Postgres storage.
- Issues seeds and verifies saves via HMAC; exposes counter and sky endpoints. Details in the plan.

## Code layout
- Exception to one-export-per-file: small domain modules (`security.py`, `session.py`, `db.py`, `encoding.py`) may group tightly-related functions.

## Prose
Soft-wrap paragraphs and list items (one physical line each). No em-dashes.
