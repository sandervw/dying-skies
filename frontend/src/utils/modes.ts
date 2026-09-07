/** semitone offsets from the root; the seed picks one mode. */
const MODES: Record<string, readonly number[]> = {
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  dorianPentatonic: [0, 2, 3, 7, 9],
  lydianPentatonic: [0, 2, 4, 6, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
};

export { MODES };
