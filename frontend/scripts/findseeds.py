"""Sample 10,000 random 32-byte seeds, find preset+instrument set+mode matches."""
import base64, pathlib, random, re, sys

MUL = 0x45d9f3b

def fnv1a_bytes(bs):
    h = 0x811c9dc5
    for b in bs:
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return h

def fnv1a_str(s):
    h = 0x811c9dc5
    for ch in s:
        h = ((h ^ ord(ch)) * 0x01000193) & 0xffffffff
    return h

def derive_seed(seed_bytes, domain):
    h = (fnv1a_bytes(seed_bytes) ^ fnv1a_str(domain)) & 0xffffffff
    h = ((h ^ (h >> 16)) * MUL) & 0xffffffff
    h = ((h ^ (h >> 16)) * MUL) & 0xffffffff
    return (h ^ (h >> 16)) & 0xffffffff

def mulberry32(s):
    state = s & 0xffffffff
    while True:
        state = (state + 0x6d2b79f5) & 0xffffffff
        mixed = state
        mixed = ((mixed ^ (mixed >> 15)) * (mixed | 1)) & 0xffffffff
        mixed ^= (mixed + ((mixed ^ (mixed >> 7)) * (mixed | 61)) & 0xffffffff) & 0xffffffff
        yield ((mixed ^ (mixed >> 14)) & 0xffffffff) / 4294967296.0

preset, instrument_set, mode = sys.argv[1], sys.argv[2], sys.argv[3]
UTILS = pathlib.Path(__file__).resolve().parent.parent / "src" / "utils"

def order(filename, const, pattern):
    body = (UTILS / filename).read_text().split(f"const {const}", 1)[1].split("= {", 1)[1].split("\n};", 1)[0]
    return re.findall(pattern, body, re.M)

# draw order in musicService.playSky: set, preset, mode
targets = [
    (names.index(name), len(names))
    for names, name in (
        (order("instrumentSets.ts", "INSTRUMENT_SETS", r"\w+"), instrument_set),
        (order("presets.ts", "PRESETS", r"^  (\w+):"), preset),
        (order("modes.ts", "MODES", r"^  (\w+):"), mode),
    )
]

ITERS = 10000
matches = []
rng = random.Random(0)

for i in range(ITERS):
    seed_bytes = bytes(rng.randint(0, 255) for _ in range(32))
    gen = mulberry32(derive_seed(seed_bytes, "music"))
    draws = [next(gen) for _ in targets]
    if all(index / count <= r < (index + 1) / count for r, (index, count) in zip(draws, targets)):
        matches.append(seed_bytes)

print(f"Tried {ITERS} seeds, found {len(matches)} matches for {preset}+{instrument_set}+{mode}")
for sb in matches:
    token = base64.urlsafe_b64encode(sb).rstrip(b"=").decode("ascii")
    print("http://localhost:5173/sky/" + token)
