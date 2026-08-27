# CLAUDE.md: Dying Skies / infra

OpenTofu that provisions one OVH VPS running the backend API, Dagster, and the analytics build. Standards and system conventions live in the root `CLAUDE.md`; this file adds only infra specifics.

## Layout
- `tofu/`: OpenTofu root. `main.tf` providers, `ovh.tf` VPS order, `cloudflare.tf` R2 backup, `provision.tf` SSH provisioning.
- `tofu/scripts/provision.sh`: system setup, Postgres, Node, uv, cloudflared, swap.
- `tofu/systemd/`: `skies-api`, `dagster-daemon`, `dagster-webserver` units.
- `dagster/dagster.yaml`: Postgres-backed Dagster storage.

## Box
- VPS-2 2027: 4 vCore / 8GB / 75GB NVMe, Ubuntu 26.04. Alias `dying-skies`.
- Ordered by hand; `tofu import ovh_vps.skies <service_name>` before apply.

## Conventions
- Service user `skies`; database `dying_skies` with `dagster` and `analytics` schemas.
- Code at `/code/skies`, data at `/files/skies`.
- Runtime secrets in `/etc/skies/.env`, read by every systemd unit.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
