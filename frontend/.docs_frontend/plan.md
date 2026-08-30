# Plan: Seed-Derived Music

Procedural music for each sky, generated from the seed like the palette and constellation. Value ranges live in `music-reference.md`.

## Goal

Every seed carries its own sound: an endless, non-repeating ambient drift with no audible loop point. Reopening a seed gives the same musical character with a fresh live performance, and no two seeds share the same ambience.

## Core technique: layered incommensurable loops

Several independent layers play at once, each a loop of a different length. The lengths share no common divisor (distinct primes), so the layers drift in and out of phase and their combination never repeats while each layer alone does.

## Consonance rule

Every note is constrained to one seed-picked mode, a small pool of five notes, six for whole-tone. Each layer draws only from that shared pool, so any notes sounding together stay in key. Five modes are available: major and minor pentatonic, dorian pentatonic, lydian pentatonic, and whole-tone.

## Variety: biomes

The seed first picks one of six biomes, each a coherent bundle of timbre, register, and density. The biome sets which archetype fills each role; the mode is picked independently. Six biomes times five modes give thirty base characters before jitter.

## Roles

Layers are role-differentiated by register. Five roles are ranked; the seed picks a layer count of three, four, or five and takes the top N, keeping low, mid, and high covered: Drone, Pad, Sparkle, Accent, Counter-pad.

## Seed to music mapping

`deriveSeed(seed, "music")` yields an independent music stream. From it the seed sets: biome; mode and root; tempo; layer count; and per layer the role, loop length (a distinct prime), octave range, density, and a timbre archetype (oscillator, ADSR, filter cutoff, reverb wet) jittered within the archetype's range.

## Static and dynamic split

The score is static per seed: biome, mode, root, tempo, loop lengths, per-layer timbre. Playback unfolds live per session. Same seed gives the same character and a new unrepeating performance each visit.

## Decisions

- Library: Tone.js for synths, transport scheduling, and reverb.
- Aesthetic: ambient drift; low tempo, low density, long attack and release.
- Default: audio starts un-muted. The top toggle shows `music_note_2` when sounding, `no_sound` when muted. Both icons are in place.

## Constraints

- Autoplay: the graph initializes on page load, but browsers keep the audio context suspended until a gesture. Traversal clicks resume it; root and screensaver stay silent until first interaction while the toggle reads un-muted.
- Performance: keep voice count and node graph small; share one master and reverb.
- UI: the toggle is the only new visible element.

## Implementation

- `services/musicService.ts`: pure generator, `seed` to `score`. Picks biome, mode, tempo, layers; assigns coprime prime loop lengths; jitters timbre within archetype ranges.
- `types/music.ts`: `Score`, `Layer`, `Biome`, `Mode`, `Archetype`.
- `hooks/useSkyMusic.ts`: builds the Tone.js graph from a score, schedules per-layer loops on the Transport, fades between skies, honors the mute toggle and first-gesture unlock.
- Existing files: wire the hook into the sky view; the toggle already exists.
- `labs/MusicLab.tsx`: grid of seeds, each a play and stop button showing its score JSON, with knob sliders like `PaletteLab`. Doubles as the autoplay-unlock check.

## Start and stop

Build the Tone graph and start the score on page load; the audio context stays suspended until the first gesture resumes it. On sky change, fade-release the old score and start the new over the shared master and reverb graph. Silence in the gallery and root; the mute toggle gates everything.

## Testing

Tests target the generator: same seed yields an identical score; loop lengths are pairwise coprime; every note lies in the mode; every parameter sits in range. `MusicLab` covers listening by ear.
