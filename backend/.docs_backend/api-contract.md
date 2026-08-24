# Backend API Contract

Frozen contract for the FastAPI backend, matching the implementation as of Stage 6. Frontend integrates against this. Concept: `../../.docs/plan.md`.

## Conventions
- All request and response bodies are JSON.
- Seeds and tags are 32-byte values, encoded as unpadded base64url strings.
- Anonymous identity travels via an httponly `session_id` cookie, set on first response that needs one (1 year, `SameSite=Lax`).
- Login state is tied to the session cookie; there is no bearer token.
- Business-logic errors use `{error: <code>, code: <code>}`, status set to match. Some errors add fields, noted per endpoint below.
- Malformed requests (bad JSON, missing or wrong-typed fields) return FastAPI's default `{detail: [...]}` shape at 422; this is separate from the `{error, code}` envelope above.
- Timestamps are ISO 8601 strings.

## Health
`GET /health` - anonymous. 200 `{status: "ok"}`.

## Stars
`POST /stars/batch` - anonymous; issues a session cookie if absent.
Body `{count: integer, 1-100}`.
200 `{stars: [{seed, tag}, ...]}`.

`POST /stars/save` - requires login.
Body `{seed, tag}`.
200 `{status: "saved"}`.
Errors: 401 `not_authenticated`; 400 `malformed_input` (bad base64url, or seed not 32 bytes); 403 `invalid_tag`; 409 `already_saved`; 409 `already_destroyed`.

`POST /stars/destroy` - requires login; caller must own the saved seed.
Body `{seed}`.
200 `{status: "destroyed"}`.
Errors: 401 `not_authenticated`; 400 `malformed_input`; 404 `not_saved` (never saved, or saved by someone else).

`GET /stars/mine` - requires login.
200 `{stars: [{seed, saved_at}, ...]}`, newest first.
Errors: 401 `not_authenticated`.

## Stats
`GET /stats` - anonymous.
200 `{saved: integer, destroyed: integer, died: integer}`.

## Auth
`GET /auth/signup-riddle` - anonymous.
200 `{riddle_id, text}`.

`POST /auth/password/check` - anonymous.
Body `{password, riddle_id}`.
200 `{rules: {color, zodiac, riddle, year, special}}`, each a boolean.

`POST /auth/signup` - anonymous; links the created account to the caller's session.
Body `{username, password, riddle_id}`.
200 `{id, username}`.
Errors: 422 `weak_password` `{error, code, rules}` (rules as above); 409 `username_taken`.

`POST /auth/login` - anonymous; links the account to the caller's session.
Body `{username, password}`.
200 `{id, username}`.
Errors: 401 `invalid_credentials`.

`POST /auth/logout` - any session.
200 `{status: "logged_out"}`.

`GET /auth/me` - any session.
200 `{id, username}`.
Errors: 401 `not_authenticated`.

## Out of scope
`GET /sky/:seed` is not part of this contract. Sky rendering from a seed is a frontend concern; the backend serves only seeds and lifecycle state.
