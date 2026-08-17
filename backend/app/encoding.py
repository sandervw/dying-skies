"""Base64url encode/decode helpers for seeds and tags."""
import base64
import binascii


def encode_base64url(value: bytes) -> str:
    """Base64url-encode bytes without padding."""
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def decode_base64url(value: str) -> bytes:
    """Base64url-decode a string, raising ValueError on bad input."""
    padded = value + "=" * (-len(value) % 4)
    try:
        return base64.urlsafe_b64decode(padded)
    except binascii.Error as error:
        raise ValueError("invalid base64url input") from error
