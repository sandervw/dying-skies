"""Tests for the signup, login, logout, me, and password-rule routes."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

import uuid

from fastapi.testclient import TestClient

from app import password_rules
from app.main import app


def _username() -> str:
    """Build a unique username for an isolated test account."""
    return f"star_{uuid.uuid4().hex[:12]}"


def _rule_password(client) -> tuple[str, str]:
    """Return a rule-satisfying password and the riddle it answers."""
    riddle = client.get("/auth/signup-riddle").json()
    answer = password_rules.get_riddle(riddle["riddle_id"])["answers"][0]
    return f"periwinkle scorpio {answer} 1999!", riddle["riddle_id"]


def _signup(client, username: str, password: str, riddle_id: str):
    """Post a signup request."""
    body = {"username": username, "password": password, "riddle_id": riddle_id}
    return client.post("/auth/signup", json=body)


def test_signup_then_duplicate_username_rejected():
    """Signup succeeds once, then is rejected as username taken."""
    with TestClient(app) as client:
        username = _username()
        password, riddle_id = _rule_password(client)

        first = _signup(client, username, password, riddle_id)
        assert first.status_code == 200
        assert first.json()["username"] == username

        again, again_id = _rule_password(client)
        second = _signup(client, username, again, again_id)
        assert second.status_code == 409
        assert second.json()["code"] == "username_taken"


def test_signup_weak_password_rejected():
    """A password missing rules is rejected with the failing rules."""
    with TestClient(app) as client:
        _, riddle_id = _rule_password(client)
        response = _signup(client, _username(), "hunter2", riddle_id)
        assert response.status_code == 422
        assert response.json()["code"] == "weak_password"
        assert response.json()["rules"]["color"] is False


def test_login_success_and_wrong_password():
    """Login succeeds with the right password, fails with the wrong one."""
    with TestClient(app) as client:
        username = _username()
        password, riddle_id = _rule_password(client)
        _signup(client, username, password, riddle_id)
        client.post("/auth/logout")

        wrong = client.post(
            "/auth/login", json={"username": username, "password": "nope"}
        )
        assert wrong.status_code == 401
        assert wrong.json()["code"] == "invalid_credentials"

        right = client.post(
            "/auth/login", json={"username": username, "password": password}
        )
        assert right.status_code == 200
        assert right.json()["username"] == username


def test_me_reflects_login_and_logout():
    """/auth/me is 401 unauthenticated, 200 after signup, 401 after logout."""
    with TestClient(app) as client:
        anonymous = client.get("/auth/me")
        assert anonymous.status_code == 401
        assert anonymous.json()["code"] == "not_authenticated"

        username = _username()
        password, riddle_id = _rule_password(client)
        _signup(client, username, password, riddle_id)

        authenticated = client.get("/auth/me")
        assert authenticated.status_code == 200
        assert authenticated.json()["username"] == username

        client.post("/auth/logout")
        after_logout = client.get("/auth/me")
        assert after_logout.status_code == 401
        assert after_logout.json()["code"] == "not_authenticated"
