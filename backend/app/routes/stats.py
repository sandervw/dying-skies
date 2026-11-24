"""The Counter: Saved, Destroyed, and Died Sky totals."""
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/stats")
async def get_stats(request: Request) -> dict:
    """Return counts of Saved, Destroyed, and Died Skies."""
    row = await request.state.pool.fetchrow(
        "SELECT "
        "(SELECT COALESCE(SUM(counter), 0)::bigint FROM sessions) AS issued, "
        "COUNT(*) FILTER (WHERE destroyed_at IS NULL) AS saved, "
        "COUNT(destroyed_at) AS destroyed "
        "FROM saved_stars"
    )
    died = row["issued"] - row["saved"] - row["destroyed"]
    return {"saved": row["saved"], "destroyed": row["destroyed"], "died": died}
