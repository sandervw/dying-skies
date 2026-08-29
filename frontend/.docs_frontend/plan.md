# Plan: Seed-Derived Music

Procedural music for each sky, generated from the seed like the palette, constellation, and stars. This document holds the concept; implementation sections follow once it is agreed.

## Goal

Every seed carries its own sound: an endless, non-repeating ambient drift with no audible loop point. Reopening a seed gives the same musical character with a fresh live performance.

## Core technique: layered incommensurable loops

Several independent layers play at once, each a loop of a different length. The lengths share no common divisor, so the layers drift in and out of phase and their combination never repeats while each layer alone does.

## Consonance rule

Every note is constrained to one seed-picked scale. Each layer draws only from that shared pool, so any notes sounding together stay in key. The default scale is pentatonic.

## Seed to music mapping

A dedicated RNG domain, `deriveSeed(seed, "music")`, yields an independent music stream, as for palette and constellation. From it the seed sets:

- root (1 of 12) and interval pattern: major pentatonic `[0, 2, 4, 7, 9]` or minor pentatonic `[0, 3, 5, 7, 10]`, as semitone offsets from the root
- tempo in BPM
- layer count, and each layer's loop length (the lengths share no common divisor)
- per layer: octave range, and density as events per bar
- per layer timbre: oscillator (`sine`, `triangle`, `sawtooth`, or `square`), ADSR envelope (attack, decay, sustain, release in seconds), low-pass filter cutoff in Hz, and reverb wet from 0 to 1

## Static and dynamic split

The score is static per seed: root, interval pattern, tempo, loop lengths, timbre. Playback unfolds live per session. Same seed gives the same character and a new unrepeating performance each visit.

## Decisions

- Library: Tone.js for synths, transport scheduling, and reverb.
- Aesthetic: ambient drift, set by low tempo, low events per bar, and long attack and release envelopes.
- Default state: audio starts un-muted. A top toggle switches it, showing `music_note_2` when sounding and `no_sound` when muted. Both icons are in place.

## Constraints

- Autoplay: browsers block audio until a user gesture. Traversal clicks satisfy it; the root and anonymous screensaver stay silent until the first interaction while the toggle reads un-muted.
- Performance: keep the voice count and node graph small.
- UI: the toggle sits with the existing top controls and is the only new visible element.

## Open questions (next sections)

- The range each parameter samples: tempo, octave range, density, interval pattern, and timbre.
- Layer count and the loop-length number set.
- File layout: a `musicService` pure generator plus a `useSkyMusic` playback hook.
- Start and stop behavior across route changes and the gallery.
- Testing a seed-deterministic system whose output is heard, not compared.
