# CLAUDE.md: Dying Skies / infra

OpenTofu that provisions one OVH VPS running the backend API, Dagster, and the analytics build. Standards and system conventions live in the root `CLAUDE.md`; this file adds only infra specifics.

## Stack
OpenTofu, local state. The VPS is ordered by hand in OVH; OpenTofu provisions it over SSH.

## Layout
- `tofu/`: OpenTofu root. `main.tf` providers, `ovh.tf` and `cloudflare.tf` provider config, `provision.tf` the SSH provisioning resources.
- `tofu/scripts/provision.sh`: system setup; Postgres, Node, uv, cloudflared, swap.
- `tofu/systemd/`: `skies-api`, `dagster-daemon`, `dagster-webserver` units.
- `dagster/dagster.yaml`: Postgres-backed Dagster storage.

## Apply
From `tofu/`: `tofu init`, `tofu plan`, `tofu apply`. Secrets come from a gitignored `*.tfvars` or `TF_VAR_*`; set `vps_ip` to the live box. Editing a provisioned file re-triggers its resource on the next apply.

## Provides
- Backend: runtime host, Postgres, the venv, `/etc/skies/.env`, `skies-api` on `127.0.0.1:8000`.
- Analytics: `dagster` and `analytics` schemas, uv, Node 24, the Dagster daemon and webserver (`127.0.0.1:3000`), swap enabled.
- cloudflared tunnels front the API and Dagster UI publicly.

## Conventions
- Service user `skies`; database `dying_skies` with `dagster` and `analytics` schemas.
- Code at `/code/skies`, data at `/files/skies`.
- Runtime secrets in `/etc/skies/.env`, read by every systemd unit.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
