# Plan: Seed-Derived Music

Procedural music for each sky, generated from the seed like the palette and constellation. Value ranges live in `music-reference.md`.

## Goal

Every seed carries its own sound: an endless, non-repeating ambient drift with no audible loop point. Reopening a seed gives the same musical character with a fresh performance, and no two seeds share the same ambience.

## Core technique: seeded chunked playback

Playback runs as roughly thirty second chunks, each rendered offline with `Tone.Offline` and played through plain `<audio>` elements, sidestepping Chrome's WebAudio-over-Bluetooth transport (see `webaudio-fixes-reference.md`). Each chunk scatters its notes from a fresh seed, so the layered drift never repeats; each chunk bakes its reverb tail, which rings over the next chunk's start so no seam is audible.

## Consonance rule

Every note is constrained to one seed-picked mode, a small pool of five notes, six for whole-tone. Each layer draws only from that shared pool, so any notes sounding together stay in key. Five modes are available: major and minor pentatonic, dorian pentatonic, lydian pentatonic, and whole-tone.

## Variety: biomes

The seed first picks one of six biomes, each a coherent bundle of timbre, register, and density. The biome sets which archetype fills each role; the mode is picked independently. Six biomes times five modes give thirty base characters before jitter.

## Roles

Layers are role-differentiated by register. Five roles are ranked; the seed picks a layer count of three, four, or five and takes the top N, keeping low, mid, and high covered: Drone, Pad, Sparkle, Accent, Counter-pad.

## Seed to music mapping

`deriveSeed(seed, "music")` yields an independent music stream. From it the seed sets: biome; mode and root; tempo; reverb; layer count; and per layer the role, octave range, density, and a timbre archetype (oscillator, ADSR, filter cutoff) jittered within the archetype's range.

## Static and dynamic split

The score is static per seed: biome, mode, root, tempo, per-layer timbre. Each visit salts the per-chunk seeds, so the same seed gives the same character and a fresh unrepeating performance.

## Decisions

- Library: Tone.js for synth graphs and reverb, rendered offline.
- Aesthetic: ambient drift; low tempo, low density, long attack and release.
- Default: audio starts un-muted. The top toggle shows `music_note_2` when sounding, `no_sound` when muted. Both icons are in place.

## Constraints

- Autoplay: the first chunk renders on page load, but media playback stays blocked until a gesture. Any click resumes it; until then every sky is silent while the toggle reads un-muted.
- Performance: keep voice count and node graph small; layers share one master gain, each sky its own reverb.
- UI: the toggle is the only new visible element.

## Implementation

- `services/musicService.ts`: pure generator, `seed` to `score`. Picks biome, mode, tempo, layers; jitters timbre within archetype ranges; scatters notes per chunk from per-chunk seeds.
- `types/music.ts`: `Score`, `Layer`, `Biome`, `Mode`, `Archetype`.
- `services/audioRenderService.ts` plus `audioEncodeService.ts`: render one chunk offline and encode it to a WAV blob url.
- `hooks/useSkyMusic.ts`: chains rendered chunks on `<audio>` elements, fades between skies, honors the mute toggle and first-gesture unlock.
- Existing files: wire the hook into the sky view; the toggle already exists.
- `labs/MusicLab.tsx`: grid of seeds, each a play and stop button showing its score JSON, with knob sliders like `PaletteLab`. Doubles as the autoplay-unlock check.

## Start and stop

Render chunk zero on page load and hand it to an audio element; further chunks render ahead and chain as each one's music ends. On sky change, fade out and revoke the old chunks, then fade in the new score's chunk zero. Music plays on every sky, including the root screensaver; only the gallery is silent. The mute toggle gates everything.

## Testing

Tests target the generator: same seed yields an identical score; every note lies in the mode; every parameter sits in range. `MusicLab` covers listening by ear.
