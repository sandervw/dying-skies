"""Sample 10,000 random 32-byte seeds, find deusex+chamber+majorPentatonic matches."""
import base64, random

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

ITERS = 10000
matches = []
rng = random.Random(0)

for i in range(ITERS):
    seed_bytes = bytes(rng.randint(0, 255) for _ in range(32))
    ms = derive_seed(seed_bytes, "music")
    gen = mulberry32(ms)
    r1 = next(gen)
    r2 = next(gen)
    r3 = next(gen)
    # deusex=3/6, chamber=1/6, majorPentatonic=0/5
    if 3/6 <= r1 < 4/6 and 1/6 <= r2 < 2/6 and 0/6 <= r3 < 1/5:
        matches.append(seed_bytes)

print(f"Tried {ITERS} seeds, found {len(matches)} matches\n")
for sb in matches:
    token = base64.urlsafe_b64encode(sb).rstrip(b"=").decode("ascii")
    print(f"http://localhost:5173/sky/{token}")