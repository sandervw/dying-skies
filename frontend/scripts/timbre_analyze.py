#!/usr/bin/env python
"""
Batch timbre analysis: run parallel OpenRouter LLM calls over every audio file
in this folder (recursively) and write a Tone.js-oriented spec sheet as a
markdown file beside each song.

Zero external Python dependencies (stdlib only). Converting .flac/.wav to
.mp3 requires ffmpeg on PATH.

Usage:
    python timbre_analyze.py                 # process all, skip existing .md
    python timbre_analyze.py --limit 1       # test run on a single file
    python timbre_analyze.py --concurrency 8
    python timbre_analyze.py --overwrite     # redo files that already have .md
"""

import argparse
import base64
import concurrent.futures as cf
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
AUDIO_EXTS = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"}
CONVERT_EXTS = {".wav", ".flac", ".ogg", ".m4a", ".aac"}
# OpenRouter's input_audio only accepts "mp3" or "wav" as the format tag.
FORMAT_TAG = {".mp3": "mp3", ".wav": "wav"}
API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-3.8-flash"

PROMPT = r"""For each distinct timbre in this file, describe it so I can translate it
directly into our Tone.js instrument-set JSON. Assign each timbre to one role slot:
- bass    (instrument types: sub | pluck | noise)
- harmony (instrument types: pad | strings | choir)
- lead    (instrument types: bell | pluck | keys | winds)
- counter (instrument types: pad | strings | swell | choir)
- accent  (instrument types: bell | sparkle | pluck)
- percussion (instrument types: kick | hat | tom)

Output condensed, terse markdown. Use one block per role you hear (skip roles that
are absent). Field names and shapes mirror our JSON exactly, so keep the same keys,
value types, and effect array form. Notes on fields:
- synth: one of Synth | FMSynth | AMSynth | MonoSynth | DuoSynth | NoiseSynth
- polyphony: integer voice count; omit for monophonic voices
- register: integer octave, roughly 1 (sub-bass) to 6 (high)
- hold: how many beats a note rings, integer
- gain: 0.0 - 1.0 output level
- options: the raw Tone constructor options (oscillator, envelope, filterEnvelope,
  modulation, harmonicity, modulationIndex, portamento, count, spread) as they apply
- filter: static post-filter { type, frequency, rolloff, Q? }
- effects: ordered list of ["EffectName", { param: value, wet: 0.0-1.0 }]

```markdown
# [Track Name] Instrument Set

---

### Role: [bass | harmony | lead | counter | accent | percussion]
* **type:** [instrument type for this role]
* **synth:** [Synth | FMSynth | AMSynth | MonoSynth | DuoSynth | NoiseSynth]
* **polyphony:** [integer, or omit if monophonic]
* **options:**
  * oscillator: `{ "type": "sine | triangle | square | sawtooth | fatsawtooth | pwm | pulse", "count": [int?], "spread": [cents?] }`
  * envelope: `{ "attack": [s], "decay": [s], "sustain": [0.0-1.0], "release": [s] }`
  * filterEnvelope (MonoSynth): `{ "attack": [s], "decay": [s], "sustain": [0.0-1.0], "release": [s], "octaves": [x] }`
  * modulation (FM/AM): `{ "type": "sine" }`, harmonicity: [float], modulationIndex: [float]
  * portamento: `[s glide, optional]`
* **register:** [integer octave 1-6]
* **hold:** [integer beats]
* **gain:** [0.0 - 1.0]
* **filter:** `{ "type": "lowpass | highpass | bandpass | notch", "frequency": [Hz], "rolloff": [-12 | -24 | -48], "Q": [x?] }`
* **effects:**
  1. `["EffectName", { "param": value, "wet": 0.0-1.0 }]`
  2. `["EffectName", { "param": value, "wet": 0.0-1.0 }]`
* **Character:** [subjective note: dark, warm, metallic, glassy, airy, aggressive...]
```"""


def load_api_key() -> str:
    """Read OPENROUTER_API_KEY from the environment, falling back to ./.env."""
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        return key.strip()
    env_path = HERE / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("OPENROUTER_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERROR: OPENROUTER_API_KEY not found in environment or ./.env")


def convert_lossless_to_mp3():
    """Convert sibling .flac/.wav files to .mp3 via ffmpeg; skip if mp3 exists."""
    for p in sorted(HERE.rglob("*")):
        if not (p.is_file() and p.suffix.lower() in CONVERT_EXTS):
            continue
        mp3_path = p.with_suffix(".mp3")
        if mp3_path.exists():
            continue
        cmd = ["ffmpeg", "-loglevel", "error", "-i", str(p),
               "-qscale:a", "2", "-y", str(mp3_path)]
        rel = p.relative_to(HERE)
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"CONVERT  {rel} -> {mp3_path.name}")
        except FileNotFoundError:
            sys.exit("ERROR: ffmpeg not found on PATH; cannot convert flac/wav.")
        except subprocess.CalledProcessError as e:
            print(f"CONVERT FAIL  {rel} -> {e.stderr.decode('utf-8', 'replace')[:200]}")


def find_audio_files():
    files = []
    for p in sorted(HERE.rglob("*")):
        if not (p.is_file() and p.suffix.lower() in AUDIO_EXTS):
            continue
        # Skip lossless originals already converted to mp3.
        if p.suffix.lower() in CONVERT_EXTS and p.with_suffix(".mp3").exists():
            continue
        files.append(p)
    return files


def build_payload(model: str, audio_path: Path) -> bytes:
    ext = audio_path.suffix.lower()
    fmt = FORMAT_TAG.get(ext)
    if fmt is None:
        raise ValueError(
            f"OpenRouter's input_audio supports only mp3/wav, got '{ext}'. "
            f"Convert {audio_path.name} first."
        )
    b64 = base64.b64encode(audio_path.read_bytes()).decode("ascii")
    body = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "input_audio",
                     "input_audio": {"data": b64, "format": fmt}},
                ],
            }
        ],
    }
    return json.dumps(body).encode("utf-8")


def call_model(model: str, api_key: str, audio_path: Path,
               timeout: int, max_retries: int = 4) -> str:
    payload = build_payload(model, audio_path)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost/timbre-analyze",
        "X-Title": "Timbre Analyze",
    }
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(API_URL, data=payload,
                                         headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:400]
            last_err = f"HTTP {e.code}: {detail}"
            # Retry on rate-limit / server errors; fail fast otherwise.
            if e.code not in (429, 500, 502, 503, 504):
                break
        except (urllib.error.URLError, TimeoutError, OSError,
                json.JSONDecodeError, KeyError, IndexError) as e:
            last_err = f"{type(e).__name__}: {e}"
        if attempt < max_retries:
            time.sleep(2 ** attempt)  # 2s, 4s, 8s backoff
    raise RuntimeError(last_err)


def process(audio_path: Path, model: str, api_key: str,
            timeout: int, overwrite: bool) -> str:
    out_path = audio_path.with_suffix(".md")
    rel = audio_path.relative_to(HERE)
    if out_path.exists() and not overwrite:
        return f"SKIP  {rel}  (md exists)"
    try:
        content = call_model(model, api_key, audio_path, timeout)
    except Exception as e:  # noqa: BLE001 - report per-file, keep batch going
        return f"FAIL  {rel}  -> {e}"
    out_path.write_text(content, encoding="utf-8")
    return f"OK    {rel}  ({len(content)} chars)"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--concurrency", type=int, default=5)
    ap.add_argument("--limit", type=int, default=0,
                    help="process only the first N pending files (0 = all)")
    ap.add_argument("--overwrite", action="store_true",
                    help="redo files that already have a .md")
    ap.add_argument("--timeout", type=int, default=300,
                    help="per-request timeout in seconds")
    args = ap.parse_args()

    api_key = load_api_key()
    convert_lossless_to_mp3()
    files = find_audio_files()
    if not args.overwrite:
        files = [f for f in files if not f.with_suffix(".md").exists()]
    if args.limit:
        files = files[: args.limit]

    if not files:
        print("Nothing to do (all files already have .md; use --overwrite to redo).")
        return

    print(f"Model: {args.model} | files: {len(files)} | "
          f"concurrency: {args.concurrency}\n")
    ok = fail = skip = 0
    start = time.time()
    with cf.ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futs = {
            ex.submit(process, f, args.model, api_key,
                      args.timeout, args.overwrite): f
            for f in files
        }
        for fut in cf.as_completed(futs):
            line = fut.result()
            print(line, flush=True)
            if line.startswith("OK"):
                ok += 1
            elif line.startswith("FAIL"):
                fail += 1
            else:
                skip += 1

    print(f"\nDone in {time.time() - start:.0f}s -> "
          f"{ok} ok, {fail} failed, {skip} skipped")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
