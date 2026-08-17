import { useQuery } from "@tanstack/react-query";
import type { Stats } from "../types/stats";
import type { Counters } from "../types/counters";
import { MOCK_STATS, toStats } from "../services/statService";

const COUNTERS_REFETCH_INTERVAL_MS = 15000;

const fetchCounters = async (): Promise<Counters> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/counters`);

  if (!response.ok) {
    throw new Error(`Failed to fetch counters: ${response.status}`);
  }

  return response.json() as Promise<Counters>;
};

const useStats = (): Stats => {
  const { data } = useQuery({
    queryKey: ["counters"],
    queryFn: fetchCounters,
    refetchInterval: COUNTERS_REFETCH_INTERVAL_MS,
  });

  return data ? toStats(data) : MOCK_STATS;
};

export { useStats };
