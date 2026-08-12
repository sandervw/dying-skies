import type { SkyStats } from "../types/skyStats";

const MOCK_SKY_STATS: SkyStats = {
  saved: 1204,
  destroyed: 318,
  died: 9462015,
};

const formatCount = (value: number): string => value.toLocaleString("en-US");

export { MOCK_SKY_STATS, formatCount };
