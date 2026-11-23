"""Tests for the star issuance and save endpoints."""
import base64
import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dying_skies"
)
os.environ.setdefault("SEED_HMAC_SECRET", "00" * 32)

from fastapi.testclient import TestClient
from helpers import get_star, rule_password, signup, unique_username

from app.main import app


def _decoded_length(value: str) -> int:
    """Base64url-decode a string and return its byte length."""
    padded = value + "=" * (-len(value) % 4)
    return len(base64.urlsafe_b64decode(padded))


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


def test_unknown_session_cookie_gets_a_fresh_session():
    """A cookie the backend never issued is replaced, never adopted."""
    with TestClient(app) as client:
        client.cookies.set("session_id", "forged")
        response = client.post("/stars/batch", json={"count": 1})
        assert response.status_code == 200
        assert response.cookies.get("session_id") not in (None, "forged")

def test_star_save_then_reject_duplicate():
    """Saving succeeds once, then is rejected as already saved."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)

        first = client.post("/stars/save", json=entry)
        assert first.status_code == 200
        assert first.json() == {"status": "saved"}

        second = client.post("/stars/save", json=entry)
        assert second.status_code == 409
        assert second.json()["code"] == "already_saved"


def test_star_save_rejects_tampered_tag():
    """A tag that does not match the seed is rejected."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)
        tampered = dict(entry, tag=("A" if entry["tag"][0] != "A" else "B") + entry["tag"][1:])

        response = client.post("/stars/save", json=tampered)
        assert response.status_code == 403
        assert response.json()["code"] == "invalid_tag"


def test_star_save_rejects_truncated_seed():
    """A seed that does not decode to 32 bytes is rejected."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)
        truncated = dict(entry, seed=entry["seed"][:-4])

        response = client.post("/stars/save", json=truncated)
        assert response.status_code == 400
        assert response.json()["code"] == "malformed_input"


def test_star_save_requires_authentication():
    """An anonymous save is rejected before decode/verify."""
    with TestClient(app) as client:
        entry = get_star(client)
        response = client.post("/stars/save", json=entry)
        assert response.status_code == 401
        assert response.json()["code"] == "not_authenticated"


def test_stars_mine_requires_authentication():
    """An anonymous caller cannot list saved stars."""
    with TestClient(app) as client:
        response = client.get("/stars/mine")
        assert response.status_code == 401
        assert response.json()["code"] == "not_authenticated"


def test_stars_mine_returns_owned_seeds_newest_first():
    """Saved seeds come back newest first."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)

        first = get_star(client)
        second = get_star(client)
        client.post("/stars/save", json=first)
        client.post("/stars/save", json=second)

        mine = client.get("/stars/mine")
        assert mine.status_code == 200
        seeds = [entry["seed"] for entry in mine.json()["stars"]]
        assert seeds == [second["seed"], first["seed"]]


def test_star_destroy_requires_authentication():
    """An anonymous destroy is rejected before decode."""
    with TestClient(app) as client:
        entry = get_star(client)
        response = client.post("/stars/destroy", json={"seed": entry["seed"]})
        assert response.status_code == 401
        assert response.json()["code"] == "not_authenticated"


def test_star_destroy_removes_saved_star_permanently():
    """Destroying a saved star removes it and blocks re-saving."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)
        client.post("/stars/save", json=entry)

        response = client.post("/stars/destroy", json={"seed": entry["seed"]})
        assert response.status_code == 200
        assert response.json() == {"status": "destroyed"}

        mine = client.get("/stars/mine").json()["stars"]
        assert entry["seed"] not in [star["seed"] for star in mine]

        resave = client.post("/stars/save", json=entry)
        assert resave.status_code == 409
        assert resave.json()["code"] == "already_destroyed"


def test_star_destroy_rejects_never_saved_seed():
    """Destroying a valid but never-saved seed is rejected."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)

        response = client.post("/stars/destroy", json={"seed": entry["seed"]})
        assert response.status_code == 404
        assert response.json()["code"] == "not_saved"


def test_star_destroy_rejects_truncated_seed():
    """A seed that does not decode to 32 bytes is rejected."""
    with TestClient(app) as client:
        password, riddle_id = rule_password(client)
        signup(client, unique_username(), password, riddle_id)
        entry = get_star(client)

        response = client.post(
            "/stars/destroy", json={"seed": entry["seed"][:-4]}
        )
        assert response.status_code == 400
        assert response.json()["code"] == "malformed_input"


def test_stars_mine_only_returns_callers_own_seeds():
    """A caller only sees their own saved seeds, not another's."""
    with TestClient(app) as client:
        password_one, riddle_one = rule_password(client)
        signup(client, unique_username(), password_one, riddle_one)
        star_one = get_star(client)
        client.post("/stars/save", json=star_one)
        cookies_one = dict(client.cookies)

        client.cookies.clear()
        password_two, riddle_two = rule_password(client)
        signup(client, unique_username(), password_two, riddle_two)
        star_two = get_star(client)
        client.post("/stars/save", json=star_two)
        cookies_two = dict(client.cookies)

        client.cookies.clear()
        client.cookies.update(cookies_one)
        mine_one = client.get("/stars/mine").json()["stars"]

        client.cookies.clear()
        client.cookies.update(cookies_two)
        mine_two = client.get("/stars/mine").json()["stars"]

        assert [entry["seed"] for entry in mine_one] == [star_one["seed"]]
        assert [entry["seed"] for entry in mine_two] == [star_two["seed"]]
