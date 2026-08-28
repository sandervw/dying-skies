# Deploy: GitHub Actions

Every push to `main` deploys the pieces it touched. Three path-filtered workflows in `.github/workflows/` each fire only when files in their folder change. `infra/` is never auto-deployed; run OpenTofu by hand.

## How it works

All three SSH to the box as `skies`, `git reset --hard origin/main` the shared `/code/skies` checkout, then do the piece's work. `wrangler` runs on the box, reading `CLOUDFLARE_API_TOKEN` from `/etc/skies/.env`.

- `frontend.yml` (`frontend/**`): `npm ci`, Vite build with `VITE_API_BASE_URL=https://api.dyingskies.com`, `wrangler deploy`.
- `backend.yml` (`backend/**`): `uv pip install` into the existing venv, restart `skies-api.service`.
- `analytics.yml` (`analytics/**`): `dbt deps` and `dbt parse`, restart `dagster-daemon` and `dagster-webserver`, then build and deploy the Observable site.

All three share the `box-deploy` concurrency group and queue.

## Setup (one time)

Add one GitHub repo secret, the private key that authenticates `skies@40.160.136.98`:

```bash
gh secret set SKIES_SSH_KEY < ~/.ssh/dying-skies_rsa
```

The box IP and deploy user are hardcoded in each workflow. Confirm `/etc/skies/.env` has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` filled.

## Manual run

Trigger any workflow by hand from the Actions tab (each has `workflow_dispatch`) or:

```bash
gh workflow run backend.yml
```
