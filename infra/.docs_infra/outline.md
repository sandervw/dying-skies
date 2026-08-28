# Dying Skies infra

OpenTofu provisions one OVH VPS that runs the backend API, Dagster (daemon and webserver), and the analytics build. The box is ordered by hand in the OVH panel; OpenTofu provisions it over SSH. State is local (`terraform.tfstate`, gitignored).

## The box
- OVH VPS, Ubuntu, static IPv4 held in `var.vps_ip` (default set in `provision.tf`).
- Reached over SSH as `ubuntu` with `~/.ssh/dying-skies_rsa`.

## tofu/ resources
Root module in `tofu/`. Providers `ovh/ovh ~> 2.0` and `cloudflare/cloudflare ~> 5.0` are configured for credentials; neither creates a resource. Three `terraform_data` resources do the work, each re-running when its source files change:
- `provision`: uploads and runs `scripts/provision.sh` as root.
- `services`: installs the three systemd units and `dagster.yaml`, then `daemon-reload` and `enable --now`.
- `tunnel`: installs cloudflared as a service from `var.cloudflare_tunnel_token`; skipped when the token is empty.

## What provision.sh sets up
- apt packages: PostgreSQL, build-essential, git, curl, unattended-upgrades.
- Service user `skies` with passwordless sudo and its own SSH key.
- Postgres role `skies`, database `dying_skies`, schemas `dagster` and `analytics` (peer auth over the unix socket).
- Node 24 plus wrangler; uv at `/home/skies/.local/bin`.
- cloudflared from Cloudflare's apt repo.
- Directories `/code/skies` (git checkout of the repo, `main`) and `/files/skies`.
- Backend venv built once with uv from `backend/requirements.txt`.
- `/etc/skies/.env` seeded once (mode 640, `root:skies`), then filled by hand.
- 4 GB swapfile.

## systemd services
All run as `skies`, read `/etc/skies/.env`, restart on failure:
- `skies-api`: uvicorn `app.main:app` on `127.0.0.1:8000` from `backend/`.
- `dagster-webserver`: `dagster-webserver` on `127.0.0.1:3000` from `analytics/`.
- `dagster-daemon`: `dagster-daemon run` from `analytics/`.

Dagster uses Postgres-backed storage: `dagster/dagster.yaml` points storage at `DAGSTER_PG_URL`, and both units set `DAGSTER_HOME=/files/skies/dagster`.

## What it provides the other pieces
- Backend: the runtime host, Postgres, the venv, `/etc/skies/.env`, and the `skies-api` service on port 8000. cloudflared fronts it publicly.
- Analytics: the `dagster` and `analytics` schemas, uv and Node 24, the Dagster daemon and webserver (port 3000), and swap enabled. cloudflared fronts the Dagster UI.

## Apply
From `tofu/`:
```
tofu init
tofu plan
tofu apply
```
Secrets come from a gitignored `*.tfvars` or `TF_VAR_*` env vars: the OVH keys, `cloudflare_api_token`, and `cloudflare_tunnel_token`. Set `vps_ip` to the live box. Editing any provisioned file (script, unit, or `dagster.yaml`) re-triggers its resource on the next apply.
