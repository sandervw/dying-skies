import type { Stats } from "../types/stats";
import { MOCK_STATS } from "../services/statService";

const useStats = (): Stats => {
  return MOCK_STATS;
};

export { useStats };
