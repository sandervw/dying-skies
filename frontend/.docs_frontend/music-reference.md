# Reference: Music generation data

Value ranges for the seed-derived music system. Concept and structure live in `plan.md`.

## Modes

Five pools, semitone offsets from the root; five notes each, six for whole-tone.

| Mode | Offsets | Feel |
|------|---------|------|
| major-pentatonic | `[0,2,4,7,9]` | bright, open |
| minor-pentatonic | `[0,3,5,7,10]` | moody, bluesy |
| dorian-pentatonic | `[0,2,3,7,9]` | minor, hopeful |
| lydian-pentatonic | `[0,2,4,6,11]` | floating, ethereal |
| whole-tone | `[0,2,4,6,8,10]` | weightless, hazy |

## Roles

Ranked by register; the seed takes the top N for a layer count N of 3, 4, or 5.

1. Drone (low) - anchor
2. Pad (mid) - harmonic wash
3. Sparkle (high) - bells or plucks
4. Accent (high or mid) - rare single notes
5. Counter-pad (low or mid) - thickening

## Timbre archetypes

Oscillator plus ADSR in seconds plus low-pass cutoff in Hz.

| Archetype | Osc | A | D | S | R | Cutoff |
|-----------|-----|---|---|---|---|--------|
| Drone | sine/triangle | 2-6 | long | ~1.0 | 6-12 | 400-1000 |
| Pad | triangle/saw | 1-4 | 2-4 | 0.6-0.9 | 4-9 | 600-1200 |
| Bell | sine/triangle | ~0.005 | 3-8 | 0 | 3-6 | 1500-4000 |
| Pluck | triangle/saw | ~0.01 | 0.5-1.5 | 0.1 | 1-3 | 1500-3500 |

## Global ranges

- Tempo: 50-75 BPM.
- Reverb: wet 0.3-0.7, decay 4-8s.
- Chunks: about thirty seconds of music each, with the reverb tail baked in.
- Density (events per bar): drone ~0.25, pad 0.5-1, sparkle 1-2, accent ~0.5.

## Biomes

Six timbral characters. Each sets which archetype fills each role plus a register and density lean. The mode is picked separately and uniformly.

| Biome | Character |
|-------|-----------|
| glass | bell-forward sparkle, airy high pad, sparse, bright, big reverb |
| warm-drift | soft triangle pads and gentle drone, mid register, moderate |
| deep-drone | dominant low sine drone plus slow counter-pad, minimal highs |
| haze | detuned slow pads, blurred, high reverb, very slow |
| chime-rain | pluck and bell forward, denser sparkle and accent, high register |
| ember | dark filtered saw pad plus low drone, low-mid, moderate |
