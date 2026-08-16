import type { Stats } from "../types/stats";

const MOCK_STATS: Stats = {
  saved: 1204,
  destroyed: 318,
  died: 9462015,
};

const formatCount = (value: number): string => value.toLocaleString("en-US");

export { MOCK_STATS, formatCount };
