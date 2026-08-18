import { useQuery } from "@tanstack/react-query";
import type { Stats } from "../types/stats";
import { MOCK_STATS } from "../services/statService";

const STATS_REFETCH_INTERVAL_MS = 15000;

const fetchStats = async (): Promise<Stats> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`);
  }

  return response.json() as Promise<Stats>;
};

/** fetches and polls sky stats. */
const useStats = (): Stats => {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: STATS_REFETCH_INTERVAL_MS,
  });

  return data ?? MOCK_STATS;
};

export { useStats };
