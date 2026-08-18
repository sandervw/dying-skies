"""Tests for the signup, login, logout, and me routes."""
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

import uuid

from fastapi.testclient import TestClient

from app.main import app


def _random_email() -> str:
    """Build a unique email for an isolated test account."""
    return f"{uuid.uuid4().hex}@example.com"


def test_signup_then_duplicate_email_rejected():
    """Signup succeeds once, then is rejected as email taken."""
    with TestClient(app) as client:
        email = _random_email()
        body = {"email": email, "password": "correct horse battery"}

        first = client.post("/auth/signup", json=body)
        assert first.status_code == 200
        assert first.json()["email"] == email

        second = client.post("/auth/signup", json=body)
        assert second.status_code == 409
        assert second.json()["code"] == "email_taken"


def test_login_success_and_wrong_password():
    """Login succeeds with the right password, fails with the wrong one."""
    with TestClient(app) as client:
        email = _random_email()
        client.post("/auth/signup", json={"email": email, "password": "right pass"})
        client.post("/auth/logout")

        wrong = client.post("/auth/login", json={"email": email, "password": "nope"})
        assert wrong.status_code == 401
        assert wrong.json()["code"] == "invalid_credentials"

        right = client.post(
            "/auth/login", json={"email": email, "password": "right pass"}
        )
        assert right.status_code == 200
        assert right.json()["email"] == email


def test_me_reflects_login_and_logout():
    """/auth/me is 401 unauthenticated, 200 after login, 401 after logout."""
    with TestClient(app) as client:
        anonymous = client.get("/auth/me")
        assert anonymous.status_code == 401
        assert anonymous.json()["code"] == "not_authenticated"

        email = _random_email()
        client.post("/auth/signup", json={"email": email, "password": "some pass"})

        authenticated = client.get("/auth/me")
        assert authenticated.status_code == 200
        assert authenticated.json()["email"] == email

        client.post("/auth/logout")
        after_logout = client.get("/auth/me")
        assert after_logout.status_code == 401
        assert after_logout.json()["code"] == "not_authenticated"
