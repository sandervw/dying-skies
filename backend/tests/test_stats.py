"""Tests for the stats endpoint."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient
from helpers import get_star, rule_password, signup, unique_username

from app.main import app


def test_stats_reflects_issued_and_saved_counts():
    """Issuing then saving stars moves counts from died to saved."""
    with TestClient(app) as client:
        before = client.get("/stats").json()

        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        first = get_star(client)
        second = get_star(client)
        client.post("/stars/save", json=first)

        after = client.get("/stats").json()
        assert after["saved"] == before["saved"] + 1
        assert after["destroyed"] == before["destroyed"]
        assert after["died"] == before["died"] + 1


def test_stats_shape_matches_contract():
    """Response contains exactly saved, destroyed, and died keys."""
    with TestClient(app) as client:
        response = client.get("/stats")
        assert response.status_code == 200
        assert set(response.json().keys()) == {"saved", "destroyed", "died"}
