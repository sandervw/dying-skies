"""Sample 10,000 random 32-byte seeds, find preset+instrument set+mode matches."""
import base64, json, pathlib, random, re, sys

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
SRC = pathlib.Path(__file__).resolve().parent.parent / "src"
UTILS, ASSETS = SRC / "utils", SRC / "assets" / "instrumentSets"

# names of a Record<string, T> literal, in source order
def keys(filename, const):
    body = (UTILS / filename).read_text().split(f"const {const}", 1)[1].split("= {", 1)[1].split("\n};", 1)[0]
    return re.findall(r"^  (\w+):", body, re.M)

PRESET_NAMES = keys("presets.ts", "PRESETS")
MODE_NAMES = keys("modes.ts", "MODES")

# each preset's role -> allowed instrument types
def load_presets():
    body = (UTILS / "presets.ts").read_text().split("const PRESETS", 1)[1]
    chunks = re.split(r"^  \w+: \{", body, flags=re.M)[1:]
    out = {}
    for name, chunk in zip(PRESET_NAMES, chunks):
        block = chunk.split("instruments: {", 1)[1].split("},", 1)[0]
        out[name] = {r: re.findall(r'"(\w+)"', a) for r, a in re.findall(r"(\w+): \[([^\]]*)\]", block)}
    return out

# each set (sorted by name) as role -> instrument type
def load_sets():
    out = {}
    for path in sorted(ASSETS.glob("*.json")):
        data = json.loads(path.read_text())
        out[data["name"]] = {r: spec["type"] for r, spec in data.items() if r != "name"}
    return out

PRESETS, SETS = load_presets(), load_sets()

# sets whose voices satisfy every role the preset needs
def sets_for_preset(name):
    need = PRESETS[name]
    return [s for s in SETS if all(r in SETS[s] and SETS[s][r] in a for r, a in need.items())]

ITERS = 10000
matches = []
rng = random.Random(0)

for i in range(ITERS):
    seed_bytes = bytes(rng.randint(0, 255) for _ in range(32))
    gen = mulberry32(derive_seed(seed_bytes, "music"))
    drawn_preset = PRESET_NAMES[int(next(gen) * len(PRESET_NAMES))]
    if drawn_preset != preset:
        continue
    pool = sets_for_preset(drawn_preset)
    if not pool or max(pool, key=lambda s: derive_seed(seed_bytes, "set:" + s)) != instrument_set:
        continue
    if MODE_NAMES[int(next(gen) * len(MODE_NAMES))] == mode:
        matches.append(seed_bytes)

print(f"Tried {ITERS} seeds, found {len(matches)} matches for {preset}+{instrument_set}+{mode}")
for sb in matches:
    token = base64.urlsafe_b64encode(sb).rstrip(b"=").decode("ascii")
    print("http://localhost:5173/sky/" + token)
