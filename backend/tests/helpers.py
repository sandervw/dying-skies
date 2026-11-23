"""Shared request helpers for the backend route tests."""
import uuid

from fastapi.testclient import TestClient

from app import password_rules


def unique_username() -> str:
    """Build a unique username for an isolated test account."""
    return f"test_{uuid.uuid4().hex[:12]}"


def rule_password(client: TestClient) -> tuple[str, str]:
    """Return a rule-satisfying password and the riddle it answers."""
    riddle = client.get("/auth/signup-riddle").json()
    answer = password_rules.get_riddle(riddle["riddle_id"])["answers"][0]
    return f"periwinkle scorpio {answer} 1999!", riddle["riddle_id"]


def signup(client: TestClient, username: str, password: str, riddle_id: str):
    """Post a signup request."""
    body = {"username": username, "password": password, "riddle_id": riddle_id}
    return client.post("/auth/signup", json=body)


def get_star(client: TestClient) -> dict:
    """Issue one star (seed/tag pair) via the batch endpoint."""
    response = client.post("/stars/batch", json={"count": 1})
    return response.json()["stars"][0]
