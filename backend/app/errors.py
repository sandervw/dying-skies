"""Shared JSON error envelope."""
from fastapi import Response


def error_response(response: Response, status_code: int, code: str) -> dict:
    """Build an {error, code} envelope and set the response status."""
    response.status_code = status_code
    return {"error": code, "code": code}
