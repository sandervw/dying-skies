"""HMAC-based seed and tag generation."""
import hashlib
import hmac
import os


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
