"""Shared slowapi limiter, keyed by the real client address."""
import os

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

# Trusted proxies between client and app; 0 ignores X-Forwarded-For.
_TRUSTED_HOPS = int(os.environ.get("TRUSTED_PROXY_HOPS", "0"))


def _client_address(request: Request) -> str:
    """Pick the client IP the trusted proxy saw, never a spoofed one."""
    if _TRUSTED_HOPS > 0:
        forwarded = request.headers.get("x-forwarded-for", "")
        parts = [part.strip() for part in forwarded.split(",") if part.strip()]
        if len(parts) >= _TRUSTED_HOPS:
            return parts[-_TRUSTED_HOPS]
    return get_remote_address(request)


# Disable in tests via RATE_LIMIT_ENABLED=false; on by default.
_enabled = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() == "true"

limiter = Limiter(key_func=_client_address, enabled=_enabled)
