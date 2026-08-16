"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

from app.db import close_pool, get_pool
from app.routes.health import router as health_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the DB pool on startup, close it on shutdown."""
    await get_pool()
    yield
    await close_pool()


app = FastAPI(lifespan=lifespan)
app.include_router(health_router)
