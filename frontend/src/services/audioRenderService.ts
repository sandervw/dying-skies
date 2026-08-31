import * as Tone from "tone";
import { encodeWavUrl } from "./audioEncodeService";
import { buildChunkEvents, chunkBars, chunkSeconds } from "./musicService";
import type { Score } from "../types/music";

const MASTER_VOLUME = 0.25; // baked into every render; tweak to taste.
const DRONE_HOLD_BEATS = 8; // longest hold in beats, from the archetype ranges.
const MAX_RELEASE_SECONDS = 12; // widest release, from the drone archetype range.
const TAIL_MARGIN_SECONDS = 2;

/** one rendered chunk: a wav blob url plus its music length. */
interface RenderedChunk {
  readonly url: string;
  readonly musicSeconds: number;
}

/** render one chunk of a score offline into a wav blob url, reverb tail included. */
const renderChunk = async (score: Score, chunkIndex: number, visitSalt: number): Promise<RenderedChunk> => {
  const bars = chunkBars(score);
  const musicSeconds = chunkSeconds(score);
  const tailSeconds =
    (DRONE_HOLD_BEATS * 60) / score.tempo + MAX_RELEASE_SECONDS + score.reverbDecay + TAIL_MARGIN_SECONDS;
  const buffer = await Tone.Offline(async (): Promise<void> => {
    const master = new Tone.Gain(MASTER_VOLUME).toDestination();
    const reverb = new Tone.Reverb({ decay: score.reverbDecay, wet: score.reverbWet });
    await reverb.ready;
    const group = new Tone.Gain(1);
    group.connect(reverb);
    reverb.connect(master);
    for (const layer of score.layers) {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: layer.oscillator },
        envelope: { attack: layer.attack, decay: layer.decay, sustain: layer.sustain, release: layer.release },
      });
      const filter = new Tone.Filter(layer.cutoff, "lowpass");
      synth.connect(filter);
      filter.connect(group);
      for (const event of buildChunkEvents(layer, score, chunkIndex, bars, visitSalt)) {
        synth.triggerAttackRelease(event.frequency, event.holdSeconds, event.timeSeconds);
      }
    }
  }, musicSeconds + tailSeconds);
  const raw = buffer.get();
  if (raw === undefined) {
    throw new Error("offline render produced no buffer");
  }
  return { url: encodeWavUrl(raw), musicSeconds };
};

export { renderChunk };
export type { RenderedChunk };
