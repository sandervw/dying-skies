# Architecture

Sections 1, 2, and 3 are binding; change them in the same PR as the code that needs it.

## 1. Pieces and contracts

The pieces share no code.

| Piece | Owns | Meets the others through |
|---|---|---|
| `frontend/` | Sky rendering, routing, interaction, music, the counter | The HTTP API in `backend/.docs_backend/api-contract.md` |
| `backend/` | Star issuance, save verification, counters, sessions, accounts, the Postgres schema | The HTTP API; the tables and grants in `analytics/.docs_analytics/data-contract.md` |
| `analytics/` | dbt marts, the Dagster schedule, the site at `/analytics/` | Read-only Postgres access as `analytics_reader` |
| `infra/` | The VPS, its services, and its tunnels | The host conventions in `infra/CLAUDE.md` |

A file imports only from its own piece. A contract document changes in the same PR as the route, wire shape, table, column, or grant it describes.

## 2. Frontend layers

| Folder (`frontend/src/`) | Imports | Holds |
|---|---|---|
| `types/`, `utils/` | each other, `Seed` from `randomService` | Shapes and static catalogs |
| `services/` | `types/`, `utils/`, other services, `webmusic-engine` | Seeded generators, codecs, backend calls, music |
| `contexts/` | `services/`, `types/` | The visible sky and the current user |
| `hooks/` | `contexts/`, `services/`, `types/`, `webmusic-engine` | Canvas loop, music playback, polling |
| `components/` | `hooks/`, `services/`, `types/` | Screens and controls |
| `labs/` | `services/`, `types/`, `utils/`, `webmusic-engine` | Developer pages served from `lab.html`; nothing imports them |

`.dependency-cruiser.cjs` holds these rules; `npm run check:architecture` fails CI on a breach.

**Pure services.** `randomService`, `paletteService`, `skyService`, `starService`, `starCanvasService`, and `routeService` take every input as an argument and read no clock, network, or unseeded randomness. The static art of a sky comes only from its seed through these modules.

**Adapters.** `starApiService` and `authService` hold every backend call except the counter poll in `useStats`. `musicService` owns the one `AudioContext`; a seed fixes its instrument set, mode, and preset, and the notes vary on each visit.

**Vendored engine.** `frontend/vendor/webmusic-engine` is never edited here.

## 3. Backend layers

| Module (`backend/app/`) | Role |
|---|---|
| `routes/` | Parse the request with Pydantic, call the rule modules, run the star, stats, and account queries, shape the response |
| `security.py`, `encoding.py`, `password_rules.py` | Rules: HMAC seeds and tags, argon2id, base64url, the password rules. `security.py` reads `SEED_HMAC_SECRET`; `password_rules.py` reads its word lists and picks a riddle at random |
| `session.py`, `login.py`, `db.py` | The session cookie and issuance count; logins; the pool, schema, roles |
| `rate_limit.py`, `errors.py`, `main.py` | The limiter, the error envelope, app wiring |

Every query binds its values as parameters. `db.py` creates the schema and the `analytics_reader` and `skies_admin` roles on startup.

## 4. Analytics flow

dbt reads the backend's tables as sources, builds staging views and mart tables into the `analytics` schema, and Observable data loaders read the marts through `observable/db.js`. Dagster runs the dbt build and the site deploy every six hours and emails the operator when a run fails.

## 5. Security

- **Accounts.** A username and a password, with no email and no reset. The signup and login fields show the password as plain text and refuse paste, drop, and autofill.
- **Password rules.** A signup password holds a colour, a zodiac sign, the answer to the assigned riddle, a digit, and a special character. The word lists and riddle answers stay on the server; `/auth/password/check` returns one boolean per rule.
- **Passwords.** Hashed with argon2id. A login for an unknown username spends the same argon2 time and returns the same error as a wrong password.
- **Sessions.** An anonymous `session_id` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` by default, one year) names a session, which holds the issuance count and is never deleted. An unknown `session_id` cookie gets a new session. A login links a session to a user in `logins`; logout deletes the login. A user keeps 4 logins, and a fifth evicts the oldest.
- **Seeds and tags.** A seed is `HMAC(secret, session_id || issuance count)` and its tag is `HMAC(secret, seed)`. A save is accepted only when the tag verifies in constant time. Destroy and list act only on the caller's own rows.
- **Rate limits.** Per client address, listed in the API contract. `X-Forwarded-For` counts only for `TRUSTED_PROXY_HOPS`.
- **Browser.** CORS allows the single `FRONTEND_ORIGIN` with credentials. The production build injects a Content Security Policy from `frontend/vite.config.ts`.
- **Analytics access.** `analytics_reader` reads `sessions`, `saved_stars`, `destroyed_stars`, and the `users` columns `id`, `username`, and `created_at`.
- **Secrets.** Runtime secrets live in `/etc/skies/.env` on the box and in each piece's gitignored `.env`. `SKIES_SSH_KEY` is the one GitHub secret.
