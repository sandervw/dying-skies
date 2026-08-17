"""Tests for the seed batch issuance endpoint."""
import base64
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient

from app.main import app


def _decoded_length(value: str) -> int:
    """Base64url-decode a string and return its byte length."""
    padded = value + "=" * (-len(value) % 4)
    return len(base64.urlsafe_b64decode(padded))


def test_seeds_batch_issues_seeds_and_sets_cookie():
    """First call sets a session cookie and returns valid seeds."""
    with TestClient(app) as client:
        response = client.post("/seeds/batch", json={"count": 5})
        assert response.status_code == 200
        assert "session_id" in response.cookies

        body = response.json()
        assert len(body["seeds"]) == 5
        for entry in body["seeds"]:
            assert _decoded_length(entry["seed"]) == 32
            assert _decoded_length(entry["tag"]) == 32

        second = client.post("/seeds/batch", json={"count": 5})
        first_seeds = {entry["seed"] for entry in body["seeds"]}
        second_seeds = {entry["seed"] for entry in second.json()["seeds"]}
        assert first_seeds.isdisjoint(second_seeds)
