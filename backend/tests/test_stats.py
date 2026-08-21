"""Tests for the stats endpoint."""
import os
import uuid

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient

from app import password_rules
from app.main import app


def _get_star(client: TestClient) -> dict:
    """Issue one star (seed/tag pair) via the batch endpoint."""
    response = client.post("/stars/batch", json={"count": 1})
    return response.json()["stars"][0]


def _username() -> str:
    """Build a unique username for an isolated test account."""
    return f"stats_{uuid.uuid4().hex[:12]}"


def _rule_password(client: TestClient) -> tuple[str, str]:
    """Return a rule-satisfying password and the riddle it answers."""
    riddle = client.get("/auth/signup-riddle").json()
    answer = password_rules.get_riddle(riddle["riddle_id"])["answers"][0]
    return f"periwinkle scorpio {answer} 1999!", riddle["riddle_id"]


def _signup(client: TestClient, username: str, password: str, riddle_id: str):
    """Post a signup request."""
    body = {"username": username, "password": password, "riddle_id": riddle_id}
    return client.post("/auth/signup", json=body)


def test_stats_reflects_issued_and_saved_counts():
    """Issuing then saving stars moves counts from died to saved."""
    with TestClient(app) as client:
        before = client.get("/stats").json()

        password, riddle_id = _rule_password(client)
        _signup(client, _username(), password, riddle_id)
        first = _get_star(client)
        second = _get_star(client)
        client.post("/stars/save", json=first)

        after = client.get("/stats").json()
        assert after["saved"] == before["saved"] + 1
        assert after["destroyed"] == 0
        assert after["died"] == before["died"] + 1


def test_stats_shape_matches_contract():
    """Response contains exactly saved, destroyed, and died keys."""
    with TestClient(app) as client:
        response = client.get("/stats")
        assert response.status_code == 200
        assert set(response.json().keys()) == {"saved", "destroyed", "died"}
