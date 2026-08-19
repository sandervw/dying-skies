"""Server-side password rule checks over secret word lists."""
import json
import random
import re
from pathlib import Path

_DATA_DIR = Path(__file__).parent / "data"


def _load(name: str) -> list:
    """Read one JSON list from the data directory."""
    with (_DATA_DIR / name).open(encoding="utf-8") as handle:
        return json.load(handle)


_COLORS = [color.lower() for color in _load("creative_colors.json")]
_ZODIAC = [sign.lower() for sign in _load("zodiac_signs.json")]
_RIDDLES = _load("riddles.json")
_RIDDLE_BY_ID = {riddle["id"]: riddle for riddle in _RIDDLES}

# rule keys returned to the client, in display order.
RULE_KEYS = ("middlename", "color", "zodiac", "riddle", "year", "special")

_SPECIAL_PATTERN = re.compile(r"[^A-Za-z0-9]")
_DIGIT_PATTERN = re.compile(r"\d")
_LETTER_PATTERN = re.compile(r"[A-Za-z]")


def _contains_any(haystack: str, needles: list) -> bool:
    """True when any needle appears anywhere in the haystack."""
    return any(needle in haystack for needle in needles)


def get_riddle(riddle_id: str) -> dict | None:
    """Return the riddle with this id, or None."""
    return _RIDDLE_BY_ID.get(riddle_id)


def random_riddle() -> dict:
    """Pick a riddle to assign on the signup page."""
    return random.choice(_RIDDLES)


def check_password(password: str, riddle_id: str) -> dict:
    """Return each rule key mapped to whether the password satisfies it."""
    lowered = password.lower()
    riddle = get_riddle(riddle_id)
    riddle_answers = [answer.lower() for answer in riddle["answers"]] if riddle else []
    return {
        "middlename": bool(_LETTER_PATTERN.search(password)),
        "color": _contains_any(lowered, _COLORS),
        "zodiac": _contains_any(lowered, _ZODIAC),
        "riddle": _contains_any(lowered, riddle_answers),
        "year": bool(_DIGIT_PATTERN.search(password)),
        "special": bool(_SPECIAL_PATTERN.search(password)),
    }


def all_rules_pass(results: dict) -> bool:
    """True when every checkable rule passed."""
    return all(results.get(key, False) for key in RULE_KEYS)
