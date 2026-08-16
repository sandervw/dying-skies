# Learning Notes

*Claude, never touch this file unless I say to.*

## Commands

**Frontend:**
`npm run dev` # run/test the frontend UI

**Backend:**
`docker compose up --build` # start the API and postgres server; add -d to run as bg task
- API → http://localhost:8000/health (returns {"status":"ok"})
- Postgres → localhost:5432
`docker compose down` # stop; add -v to wipe the db

## Techs/Terms

**Backend:**
- `FastAPI` - Python's modern async web framework
- `Postgres 16` - the database; talked to via `asyncpg`, async driver, keeps a connection pool (reused DB connections) open
- `Docker` + `Docker Compose` - runs everything in containers; wires two services together (api + db) and uses a healthcheck so the API waits until Postgres is actually ready
- `Dockerfile` - recipe that builds the API image (python:3.12-slim base)
- `Terraform` - infrastructure-as-code for the cloud deploy (GCP)

**Frontend:**
- `Seed` - single value that deterministically generates an entire sky (dots, constellation, palette, star motion). Same seed always yields the same art.
- `256-bit` - a seed space so vast that collisions are effectively impossible
- `base64url codec` - encodes those 32 bytes into a compact 43-character string, so /sky/<seed> links stay shareable.
- `Deterministic PRNG` - a seeded pseudo-random generator (`mulberry32`) plus domain-splitting (`deriveSeed`): one seed spawns many independent random streams, one per visual concern. An `FNV-1a hash` folds all 32 bytes into that generator.
- `ROOT_SEED` - the fixed "origin of the universe" sky