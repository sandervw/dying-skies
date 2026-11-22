"""Global star lifecycle stats route."""
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/stats")
async def get_stats(request: Request) -> dict:
    """Return counts of saved, destroyed, and died stars."""
    pool = request.state.pool
    issued = await pool.fetchval(
        "SELECT COALESCE(SUM(counter), 0)::bigint FROM sessions"
    )
    saved = await pool.fetchval("SELECT COUNT(*) FROM saved_stars")
    destroyed = await pool.fetchval("SELECT COUNT(*) FROM destroyed_stars")
    died = issued - saved - destroyed
    return {"saved": saved, "destroyed": destroyed, "died": died}
