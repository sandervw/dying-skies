"""Tests for the star issuance and save endpoints."""
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


def _get_star(client: TestClient) -> dict:
    """Issue one star (seed/tag pair) via the batch endpoint."""
    response = client.post("/stars/batch", json={"count": 1})
    return response.json()["stars"][0]


def test_stars_batch_issues_stars_and_sets_cookie():
    """First call sets a session cookie and returns valid stars."""
    with TestClient(app) as client:
        response = client.post("/stars/batch", json={"count": 5})
        assert response.status_code == 200
        assert "session_id" in response.cookies

        body = response.json()
        assert len(body["stars"]) == 5
        for entry in body["stars"]:
            assert _decoded_length(entry["seed"]) == 32
            assert _decoded_length(entry["tag"]) == 32

        second = client.post("/stars/batch", json={"count": 5})
        first_seeds = {entry["seed"] for entry in body["stars"]}
        second_seeds = {entry["seed"] for entry in second.json()["stars"]}
        assert first_seeds.isdisjoint(second_seeds)


def test_star_save_then_reject_duplicate():
    """Saving succeeds once, then is rejected as already saved."""
    with TestClient(app) as client:
        entry = _get_star(client)

        first = client.post("/stars/save", json=entry)
        assert first.status_code == 200
        assert first.json() == {"status": "saved"}

        second = client.post("/stars/save", json=entry)
        assert second.status_code == 409
        assert second.json()["code"] == "already_saved"


def test_star_save_rejects_tampered_tag():
    """A tag that does not match the seed is rejected."""
    with TestClient(app) as client:
        entry = _get_star(client)
        tampered = dict(entry, tag=("A" if entry["tag"][0] != "A" else "B") + entry["tag"][1:])

        response = client.post("/stars/save", json=tampered)
        assert response.status_code == 403
        assert response.json()["code"] == "invalid_tag"


def test_star_save_rejects_truncated_seed():
    """A seed that does not decode to 32 bytes is rejected."""
    with TestClient(app) as client:
        entry = _get_star(client)
        truncated = dict(entry, seed=entry["seed"][:-4])

        response = client.post("/stars/save", json=truncated)
        assert response.status_code == 400
        assert response.json()["code"] == "malformed_input"
