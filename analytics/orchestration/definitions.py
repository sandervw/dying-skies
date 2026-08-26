"""Dagster code location: assets, schedule, failure alert, resources."""
from __future__ import annotations

import dagster
from dagster_dbt import DbtCliResource

from . import alert, assets

all_assets = dagster.load_assets_from_modules([assets])

refresh_job = dagster.define_asset_job(
    "refresh_job",
    selection="*",
    description="Build dbt marts, then build and deploy the analytics site.",
)

refresh_schedule = dagster.ScheduleDefinition(
    name="refresh",
    job=refresh_job,
    cron_schedule="0 */6 * * *",
    execution_timezone="America/Chicago",
    description="Every 6 hours: rebuild marts, redeploy the site.",
)


@dagster.run_failure_sensor(
    monitored_jobs=[refresh_job],
    default_status=dagster.DefaultSensorStatus.RUNNING,
    description="Email on any failed analytics run.",
)
def failure_alert(context: dagster.RunFailureSensorContext) -> None:
    """Email the operator when an analytics run fails."""
    run = context.dagster_run
    body = (
        f"Job {run.job_name} failed.\n"
        f"Run id: {run.run_id}\n\n"
        f"{context.failure_event.message}"
    )
    alert.send(f"dying-skies analytics failed: {run.job_name}", body)


defs = dagster.Definitions(
    assets=all_assets,
    jobs=[refresh_job],
    schedules=[refresh_schedule],
    sensors=[failure_alert],
    resources={"dbt": DbtCliResource(project_dir=assets.dbt_project, target="dev")},
)
