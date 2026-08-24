"""Test environment defaults, applied before app import."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)
os.environ["COOKIE_SECURE"] = "false"
os.environ["RATE_LIMIT_ENABLED"] = "false"
