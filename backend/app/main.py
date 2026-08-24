"""FastAPI application entrypoint."""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.db import close_pool, ensure_analytics_role, ensure_schema, get_pool
from app.rate_limit import limiter
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.stars import router as stars_router
from app.routes.stats import router as stats_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the DB pool on startup, close it on shutdown."""
    pool = await get_pool()
    await ensure_schema(pool)
    await ensure_analytics_role(pool)
    yield
    await close_pool()


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(health_router)
app.include_router(stars_router)
app.include_router(stats_router)
