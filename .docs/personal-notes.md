# Learning Notes

*Claude, never touch this file unless I say to.*

## Commands

**Frontend:**
`npm run dev` # run/test the frontend UI

**Backend Local:**
`docker compose up --build` # start the API and postgres server; add -d to run as bg task
- API → http://localhost:8000/health (returns {"status":"ok"})
- Postgres → localhost:5432
`docker compose down` # stop; add -v to wipe the db

**Backend:**


## Techs/Terms

**Backend:**
- `FastAPI` - Python's modern async web framework
- `Postgres 18` - the database; talked to via `asyncpg`, async driver, keeps a connection pool (reused DB connections) open
- `Docker` + `Docker Compose` - runs everything in containers; wires two services together (api + db) and uses a healthcheck so the API waits until Postgres is actually ready
- `Dockerfile` - recipe that builds the API image (python:3.12-slim base)
- `OpenTofu` - infrastructure-as-code for the deploy

**Frontend:**
- `Seed` - single value that deterministically generates an entire sky (dots, constellation, palette, star motion). Same seed always yields the same art.
- `256-bit` - a seed space so vast that collisions are effectively impossible
- `base64url codec` - encodes those 32 bytes into a compact 43-character string, so /sky/<seed> links stay shareable.
- `Deterministic PRNG` - a seeded pseudo-random generator (`mulberry32`) plus domain-splitting (`deriveSeed`): one seed spawns many independent random streams, one per visual concern. An `FNV-1a hash` folds all 32 bytes into that generator.
- `ROOT_SEED` - the fixed "origin of the universe" sky

## Design

**Backend:**
`POST /stars/batch` - hands the client a fresh batch of star "seeds" to fall across the screen; the endpoint:
1. Identifies your session (via cookie, below)
2. Reserves a range of counter numbers for you
3. For each counter, computes a seed and a matching tag.
4. Returns them as a JSON list of {seed, tag} strings.
5. *Nothing is stored per seed; the server can always recompute them later.*
`HMAC` - hash-based Message Authentication Code. Feed it a secret key (`secret`) plus data; it spits out a fingerprint
- Deterministic: same secret + same data always gives the same output
- Unforgeable: without knowing the secret, you cannot produce a valid output for any data. The secret lives only on the server
- `seed` - HMAC(secret, session_id + counter) - unique, unguessable, and collision-proof (32 bytes)
- `tag` - HMAC(secret, seed) - a second fingerprint, this time of the seed.
- `Why two?` when you save a star, the client sends {seed, tag} back. The server recomputes HMAC(secret, seed) and checks it equals the submitted tag. If it matches, the seed must have come from us, because only we hold the secret. This stops anyone from inventing fake seeds. And it works statelessly: the server never had to remember which seeds it issued. The tag is the receipt; the seed alone isn't verifiable because the server no longer knows which counter produced it.
`cookie` - a small piece of data the server gives to browser; browser attaches to every future request

`The flow:`
1. First visit: browser sends no cookie. Server generates a random session_id, saves a row (session_id, counter=0), and replies with Set-Cookie: session_id=....
2. Browser stores it and auto-sends it on every later request - you never handle it manually.
3. /stars/batch: server reads your session_id from the cookie, mints seeds/tags, returns them. They render as falling stars, each carrying its seed and tag in the client's memory.
4. Save (future): client posts a star's {seed, tag}; server verifies via the tag.
5. Our cookie is set httponly (JavaScript can't read it, blocking theft via injected scripts) and samesite=lax (limits it being sent from other sites, blocking a common forgery attack). secure means "only send over HTTPS."

`CORS` - Cross-Origin Resource Sharing. Browsers enforce a "same-origin policy": JavaScript running on frontend.com is, by default, blocked from reading responses from a different origin like api.backend.com. CORS is how the server says "I permit this specific frontend to call me." If FRONTEND_ORIGIN is empty when the frontend goes live, every real request gets silently rejected. Hence the flag.