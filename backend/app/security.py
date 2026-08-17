"""HMAC-based seed and tag generation."""
import hashlib
import hmac
import os


def load_hmac_key() -> bytes:
    """Load the hex-encoded seed HMAC key from the environment."""
    return bytes.fromhex(os.environ["SEED_HMAC_KEY"])


def generate_seed(session_id: str, counter: int, key: bytes) -> bytes:
    """Derive a 32-byte seed from session id and counter."""
    message = session_id.encode() + counter.to_bytes(8, "big")
    return hmac.new(key, message, hashlib.sha256).digest()


def generate_tag(seed: bytes, key: bytes) -> bytes:
    """Derive a 32-byte tag authenticating a seed."""
    return hmac.new(key, seed, hashlib.sha256).digest()
