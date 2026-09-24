/** displayName plus semitone offsets from the root; the seed picks one mode. */
const MODES: Record<string, { readonly displayName: string; readonly offsets: readonly number[] }> = {
  majorPentatonic: { displayName: "Major Pentatonic", offsets: [0, 2, 4, 7, 9] },
  minorPentatonic: { displayName: "Minor Pentatonic", offsets: [0, 3, 5, 7, 10] },
  dorianPentatonic: { displayName: "Dorian Pentatonic", offsets: [0, 2, 3, 7, 9] },
  lydianPentatonic: { displayName: "Lydian Pentatonic", offsets: [0, 2, 4, 6, 11] },
  wholeTone: { displayName: "Whole Tone", offsets: [0, 2, 4, 6, 8, 10] },
  egyptian: { displayName: "Egyptian", offsets: [0, 2, 5, 7, 10] },
  ritusen: { displayName: "Ritusen", offsets: [0, 2, 5, 7, 9] },
  manGong: { displayName: "Man Gong", offsets: [0, 3, 5, 8, 10] },
};

export { MODES };
