"""Tests for the star save verification endpoint."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient

from app.main import app


def _get_seed_tag(client: TestClient) -> dict:
    """Issue one seed/tag pair via the batch endpoint."""
    response = client.post("/seeds/batch", json={"count": 1})
    return response.json()["seeds"][0]


def test_star_save_then_reject_duplicate():
    """Saving succeeds once, then is rejected as already saved."""
    with TestClient(app) as client:
        entry = _get_seed_tag(client)

        first = client.post("/stars/save", json=entry)
        assert first.status_code == 200
        assert first.json() == {"status": "saved"}

        second = client.post("/stars/save", json=entry)
        assert second.status_code == 409
        assert second.json()["code"] == "already_saved"


def test_star_save_rejects_tampered_tag():
    """A tag that does not match the seed is rejected."""
    with TestClient(app) as client:
        entry = _get_seed_tag(client)
        tampered = dict(entry, tag=("A" if entry["tag"][0] != "A" else "B") + entry["tag"][1:])

        response = client.post("/stars/save", json=tampered)
        assert response.status_code == 403
        assert response.json()["code"] == "invalid_tag"


def test_star_save_rejects_truncated_seed():
    """A seed that does not decode to 32 bytes is rejected."""
    with TestClient(app) as client:
        entry = _get_seed_tag(client)
        truncated = dict(entry, seed=entry["seed"][:-4])

        response = client.post("/stars/save", json=truncated)
        assert response.status_code == 400
        assert response.json()["code"] == "malformed_input"
