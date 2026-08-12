import type { SkyStats } from "../types/skyStats";
import { MOCK_SKY_STATS } from "../services/skyStats";

const useSkyStats = (): SkyStats => {
  return MOCK_SKY_STATS;
};

export { useSkyStats };
