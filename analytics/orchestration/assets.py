"""Dagster assets: dbt marts and the Observable Framework site."""
from __future__ import annotations

import subprocess
from pathlib import Path

import dagster
from dagster_dbt import DbtCliResource, DbtProject, dbt_assets

ANALYTICS = Path(__file__).resolve().parents[1]

# Prebuilt manifest in prod; regenerated under `dagster dev`.
dbt_project = DbtProject(project_dir=ANALYTICS / "dbt")
dbt_project.prepare_if_dev()


def _run(command: str, cwd: Path) -> None:
    """Run a shell command, raising on non-zero exit."""
    subprocess.run(command, cwd=cwd, shell=True, check=True)


@dbt_assets(manifest=dbt_project.manifest_path)
def dbt_models(context, dbt: DbtCliResource):
    """dbt: build staging views and marts; each node its own asset."""
    yield from dbt.cli(["build"], context=context).stream()


@dagster.asset(deps=list(dbt_models.keys))
def analytics_site() -> None:
    """Observable Framework: build the /analytics site and deploy it."""
    _run("npm run deploy", ANALYTICS / "observable")
