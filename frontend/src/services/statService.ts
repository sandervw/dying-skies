import type { Stats } from "../types/stats";
import type { Counters } from "../types/counters";

const MOCK_STATS: Stats = {
  saved: 1204,
  destroyed: 318,
  died: 9462015,
};

const formatCount = (value: number): string => value.toLocaleString("en-US");

const toStats = (counters: Readonly<Counters>): Stats => ({
  saved: counters.saved,
  destroyed: counters.destroyed,
  died: counters.issued - counters.saved - counters.destroyed,
});

export { MOCK_STATS, formatCount, toStats };
