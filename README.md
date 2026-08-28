# Dying Skies

Live at [dyingskies.com](https://dyingskies.com)

An infinite, procedurally-generated universe. Every sky is a unique world, and millions of them die every second.

## The experience

You arrive on a black field. Stars fall across it, each one a whole sky waiting to exist. Watch, and they slip past the bottom edge unseen. Every star that falls away unclicked is a sky that no one will ever visit, gone. The homepage keeps the tally: how many skies humanity has *saved*, *destroyed*, and *let die*.

Click a falling star and you save it. Its sky opens around you, generated art, and new stars begin to fall through it. Click again and you fall into the next. There is no end to this. You can traverse skies forever, each born from the one before.

Every sky comes from a 256-bit seed, so the art is fixed and repeatable while the falling stars are always new. Open the same seed twice and you get the same world with a fresh chance to save the stars crossing it. Any sky is a shareable link, so you can hand someone the exact world you found.

Most stars will die.

## The project

Four pieces, each self-contained, integrating over defined contracts.

**Frontend**. The visual layer: seed rendering, routing, interaction, and the counter. Vite and React with a Canvas 2D renderer, deployed on Cloudflare.

**Backend**. Seed issuance, save verification, the global counters, persistence, and auth. FastAPI and Postgres, running on an OVH VPS.

**Analytics**. The metrics pipeline behind the public breakdown at dyingskies.com/analytics. Dagster, dbt, and Observable Framework.

**Infra**. The OVH VPS that hosts the backend and analytics, provisioned with OpenTofu.

## Deploy

Pushes to main deploy the pieces they touch through GitHub Actions. Infrastructure is applied by hand with OpenTofu.

Each piece carries its own README and docs; cross-cutting design lives in .docs, and the full concept is in .docs/outline.md.
