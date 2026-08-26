"""Failure alerts via the Cloudflare Email Sending REST API."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

TOKEN_FILE = Path("~/.config/dying-skies/cf_token").expanduser()
ALERT_FROM = os.environ.get("ALERT_FROM", "alerts@dyingskies.com")
ALERT_TO = os.environ.get("ALERT_TO", "samvanwilligen@gmail.com")


def _token() -> str:
    """Read the Cloudflare token from env, else the box file."""
    return os.environ.get("CLOUDFLARE_API_TOKEN") or TOKEN_FILE.read_text().strip()


def _endpoint() -> str:
    """Build the account-scoped Email Sending endpoint."""
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    return f"https://api.cloudflare.com/client/v4/accounts/{account_id}/email/sending/send"


def send(subject: str, text: str) -> None:
    """Send one transactional alert via Cloudflare Email Sending."""
    payload = json.dumps(
        {
            "to": ALERT_TO,
            "from": {"address": ALERT_FROM, "name": "dying-skies analytics"},
            "subject": subject,
            "text": text,
        }
    ).encode()
    request = urllib.request.Request(
        _endpoint(),
        data=payload,
        headers={"Authorization": f"Bearer {_token()}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"cloudflare email {error.code}: {error.read().decode()}") from error
    if not body.get("success"):
        raise RuntimeError(f"cloudflare email failed: {body.get('errors')}")
    print(f"alert sent -> {ALERT_TO}")


if __name__ == "__main__":
    message = sys.argv[1] if len(sys.argv) > 1 else "test alert"
    send("dying-skies analytics: test alert", message)
