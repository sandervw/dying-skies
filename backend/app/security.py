"""HMAC-based seed/tag generation and password hashing."""
import hashlib
import hmac
import os

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_password_hasher = PasswordHasher()
_DUMMY_HASH = _password_hasher.hash("dying-skies-timing-guard")


def load_secret() -> bytes:
    """Load the hex-encoded seed HMAC secret from the environment."""
    return bytes.fromhex(os.environ["SEED_HMAC_SECRET"])


def generate_seed(session_id: str, counter: int, secret: bytes) -> bytes:
    """Derive a 32-byte seed from session id and counter."""
    message = session_id.encode() + counter.to_bytes(8, "big")
    return hmac.new(secret, message, hashlib.sha256).digest()


def generate_tag(seed: bytes, secret: bytes) -> bytes:
    """Derive a 32-byte tag authenticating a seed."""
    return hmac.new(secret, seed, hashlib.sha256).digest()


def verify_tag(seed: bytes, tag: bytes, secret: bytes) -> bool:
    """Constant-time check that tag authenticates seed."""
    return hmac.compare_digest(generate_tag(seed, secret), tag)


def hash_password(password: str) -> str:
    """Hash a password with argon2id."""
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a password against its argon2id hash."""
    try:
        return _password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def dummy_verify(password: str) -> None:
    """Burn equivalent argon2 time to mask missing-user timing."""
    verify_password(password, _DUMMY_HASH)
