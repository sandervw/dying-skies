"""Sample 10,000 random 32-byte seeds, find preset+instrument set+mode matches."""
import base64, pathlib, random, re, sys

MUL = 0x45d9f3b

def fnv1a_bytes(values):
    """Fold bytes into a 32-bit FNV-1a hash."""
    hashed = 0x811c9dc5
    for value in values:
        hashed = ((hashed ^ value) * 0x01000193) & 0xffffffff
    return hashed

def fnv1a_text(text):
    """Fold a string's characters into a 32-bit FNV-1a hash."""
    hashed = 0x811c9dc5
    for character in text:
        hashed = ((hashed ^ ord(character)) * 0x01000193) & 0xffffffff
    return hashed

def derive_seed(seed_bytes, domain):
    """Mix a seed and a domain label into one 32-bit seed."""
    hashed = (fnv1a_bytes(seed_bytes) ^ fnv1a_text(domain)) & 0xffffffff
    hashed = ((hashed ^ (hashed >> 16)) * MUL) & 0xffffffff
    hashed = ((hashed ^ (hashed >> 16)) * MUL) & 0xffffffff
    return (hashed ^ (hashed >> 16)) & 0xffffffff

def mulberry32(seed):
    """Yield the repeatable 0..1 stream randomService makes for a seed."""
    state = seed & 0xffffffff
    while True:
        state = (state + 0x6d2b79f5) & 0xffffffff
        mixed = state
        mixed = ((mixed ^ (mixed >> 15)) * (mixed | 1)) & 0xffffffff
        mixed ^= (mixed + ((mixed ^ (mixed >> 7)) * (mixed | 61)) & 0xffffffff) & 0xffffffff
        yield ((mixed ^ (mixed >> 14)) & 0xffffffff) / 4294967296.0

preset, instrument_set, mode = sys.argv[1], sys.argv[2], sys.argv[3]
SOURCE = pathlib.Path(__file__).resolve().parent.parent / "src"
CATALOGS, ASSETS = SOURCE / "utils", SOURCE / "assets" / "instrumentSets"

def order(filename, const):
    """List a catalog's keys in the order its source file declares them."""
    body = (CATALOGS / filename).read_text().split(f"const {const}", 1)[1].split("= {", 1)[1].split("\n};", 1)[0]
    return re.findall(r"^  (\w+):", body, re.M)

# set names are the JSON filenames; the seed picks the highest derive_seed
SET_NAMES = sorted(path.stem for path in ASSETS.glob("*.json"))

# random draw order in musicService.playSky: preset, mode (set is rendezvous-hashed)
stream = [
    (names.index(name), len(names))
    for names, name in (
        (order("presets.ts", "PRESETS"), preset),
        (order("modes.ts", "MODES"), mode),
    )
]

ITERS = 10000
matches = []
rng = random.Random(0)

for attempt in range(ITERS):
    seed_bytes = bytes(rng.randint(0, 255) for _ in range(32))
    if max(SET_NAMES, key=lambda set_name: derive_seed(seed_bytes, f"set:{set_name}")) != instrument_set:
        continue
    generator = mulberry32(derive_seed(seed_bytes, "music"))
    draws = [next(generator) for _ in stream]
    if all(index / count <= draw < (index + 1) / count for draw, (index, count) in zip(draws, stream)):
        matches.append(seed_bytes)

print(f"Tried {ITERS} seeds, found {len(matches)} matches for {preset}+{instrument_set}+{mode}")
for match in matches:
    token = base64.urlsafe_b64encode(match).rstrip(b"=").decode("ascii")
    print("http://localhost:5173/sky/" + token)
