# Backend Plan

FastAPI + Postgres. Concept: `../../.docs/plan.md`. Live on GCP Cloud Run + Cloud SQL. Work breaks into the stages below; an agent implements exactly one stage per pass.

## Hosting
GCP: FastAPI container on Cloud Run, Postgres on Cloud SQL. Frontend stays on Cloudflare. Deploy via Docker image + `gcloud run deploy`; infra as Terraform.

## Stage 1: Project and infra scaffold - DONE
- FastAPI app skeleton with a health check route.
- Postgres connection setup (local dev via Docker Compose or equivalent).
- Dockerfile for the FastAPI service.
- Terraform skeleton for Cloud Run + Cloud SQL (no live deploy yet).

## Stage 2: Session identity and seed issuance - DONE
- On first sky-open, the server sets an anonymous session cookie carrying `session_id`.
- The server holds a secret key called `secret`.
- `POST /stars/batch` issues a batch of stars. Each carries a seed, the full 256-bit `HMAC-SHA256(secret, session_id || counter)` output; the counter increments and nothing is stored per issue.
- 256 bits covers visual generation now and future MIDI audio; the seed space makes collisions effectively impossible at any real scale.
- Each falling star carries its `seed` and `tag`.
- Confirmed: `tag = HMAC-SHA256(secret, seed)`, a separate MAC over the seed. Stage 3 verifies saves statelessly by recomputing this HMAC; nothing is stored per issue.

## Stage 3: Save verification and persistence - DONE
- `POST /stars/save` accepts `{seed, tag}` from the client.
- The server recomputes the HMAC, checks the tag, checks the seed is unsaved, stores the 32-byte seed, and increments the saved counter.
- Offscreen stars are never reported.
- Only saved stars persist; storage stays negligible in practice.
- Saved and destroyed records store a timestamp of the save/destroy event (cross-piece requirement from analytics: historical trends are derived from row timestamps, since the counters are mutable totals).

## Stage 4: Stats and sky data endpoints - DONE
- `GET /stats` - DONE. Returns `{saved, destroyed, died}`; `issued` sums `sessions.counter`, `saved` counts `saved_stars`, `destroyed` counts `destroyed_stars`, `died = issued - saved - destroyed`.

## Stage 5: Auth - DONE
Accounts and login-gated saving live. `saved_stars` gains `owner_id`.

## Stage 6: API contract finalized against frontend - DONE
- Full contract in `api-contract.md`: health, stars batch/save/destroy/mine, stats, auth.
- Seeds and tags travel as base64url strings in JSON.
- Errors use a `{error, code}` envelope.
- `GET /sky/:seed` is out of scope; sky rendering is a frontend concern.

## Stage 7: Deploy - DONE (custom domain pending)
- Image builds via Cloud Build to Artifact Registry repo `dying-skies`.
- Cloud SQL, Cloud Run, and Secret Manager provisioned by OpenTofu in `terraform/`.
- Live at https://dying-skies-api-rkfq6shtia-uc.a.run.app; secrets injected from Secret Manager.
- Remaining: map `api.dyingskies.com`; point the frontend API base URL at it.

## Analytics access
`ensure_analytics_role` in `app/db.py` is the single source of truth for analytics DB access. On startup it provisions the `analytics_reader` role, grants `CONNECT` + `USAGE` + `SELECT` on `sessions`, `saved_stars`, `destroyed_stars`, and `users`, and creates an `analytics` schema owned by `analytics_reader` so dbt can materialize marts there. The reader password comes from `ANALYTICS_READER_PASSWORD`; unset skips provisioning.
