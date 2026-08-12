import type { RandomNumberGenerator } from "./seededRandom";
import type { Dot } from "../types/sky";

// tunable range for dot count.
const DOT_COUNT_MINIMUM = 4;
const DOT_COUNT_MAXIMUM = 200;

// map a 0..1 draw into the [minimum, maximum) range.
const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

// build the static dot field; x/y are 0..1 fractions.
const generateDots = (random: RandomNumberGenerator): readonly Dot[] => {
  const count = Math.floor(
    randomInRange(random, DOT_COUNT_MINIMUM, DOT_COUNT_MAXIMUM + 1),
  );
  const dots: Dot[] = [];
  for (let index = 0; index < count; index += 1) {
    dots.push({
      x: random(),
      y: random(),
    });
  }
  return dots;
};

export { generateDots };
