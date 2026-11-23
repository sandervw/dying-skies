"""Tests for the signup, login, logout, me, and password-rule routes."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient
from helpers import get_star, rule_password, signup, unique_username

from app.main import app


def test_signup_then_duplicate_username_rejected():
    """Signup succeeds once, then is rejected as username taken."""
    with TestClient(app) as client:
        username = unique_username()
        password, riddle_id = rule_password(client)

        first = signup(client, username, password, riddle_id)
        assert first.status_code == 200
        assert first.json()["username"] == username

        again, again_id = rule_password(client)
        second = signup(client, username, again, again_id)
        assert second.status_code == 409
        assert second.json()["code"] == "username_taken"


def test_signup_weak_password_rejected():
    """A password missing rules is rejected with the failing rules."""
    with TestClient(app) as client:
        _, riddle_id = rule_password(client)
        response = signup(client, unique_username(), "hunter2", riddle_id)
        assert response.status_code == 422
        assert response.json()["code"] == "weak_password"
        assert response.json()["rules"]["color"] is False


def test_login_success_and_wrong_password():
    """Login succeeds with the right password, fails with the wrong one."""
    with TestClient(app) as client:
        username = unique_username()
        password, riddle_id = rule_password(client)
        signup(client, username, password, riddle_id)
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


def _use_session(client, session_id: str) -> None:
    """Point the client at one session cookie."""
    client.cookies.clear()
    client.cookies.set("session_id", session_id)


def _is_logged_in(client, session_id: str) -> bool:
    """Switch the client to a session; report whether it is logged in."""
    _use_session(client, session_id)
    return client.get("/auth/me").status_code == 200


def test_fifth_login_evicts_oldest_but_keeps_its_session():
    """A fifth login logs the oldest device out; its issued stars survive."""
    with TestClient(app) as client:
        username = unique_username()
        password, riddle_id = rule_password(client)
        signup(client, username, password, riddle_id)
        oldest = client.cookies.get("session_id")
        first_star = get_star(client)
        died_before = client.get("/stats").json()["died"]

        newer = []
        for _ in range(4):
            client.cookies.clear()
            login = client.post(
                "/auth/login", json={"username": username, "password": password}
            )
            assert login.status_code == 200
            newer.append(client.cookies.get("session_id"))

        assert all(_is_logged_in(client, session_id) for session_id in newer)
        assert not _is_logged_in(client, oldest)
        assert client.get("/stats").json()["died"] == died_before
        _use_session(client, oldest)
        assert get_star(client)["seed"] != first_star["seed"]


def test_me_reflects_login_and_logout():
    """/auth/me is 401 unauthenticated, 200 after signup, 401 after logout."""
    with TestClient(app) as client:
        anonymous = client.get("/auth/me")
        assert anonymous.status_code == 401
        assert anonymous.json()["code"] == "not_authenticated"

        username = unique_username()
        password, riddle_id = rule_password(client)
        signup(client, username, password, riddle_id)

        authenticated = client.get("/auth/me")
        assert authenticated.status_code == 200
        assert authenticated.json()["username"] == username

        client.post("/auth/logout")
        after_logout = client.get("/auth/me")
        assert after_logout.status_code == 401
        assert after_logout.json()["code"] == "not_authenticated"
