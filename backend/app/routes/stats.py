"""Global star lifecycle stats route."""
from fastapi import APIRouter

from app.db import get_pool

router = APIRouter()


@router.get("/stats")
async def get_stats() -> dict:
    """Return counts of saved, destroyed, and died stars."""
    pool = await get_pool()
    issued = await pool.fetchval(
        "SELECT COALESCE(SUM(counter), 0)::bigint FROM sessions"
    )
    saved = await pool.fetchval("SELECT COUNT(*) FROM saved_stars")
    destroyed = 0
    died = issued - saved - destroyed
    return {"saved": saved, "destroyed": destroyed, "died": died}
