import { useQuery } from "@tanstack/react-query";

interface Stats {
  readonly saved: number;
  readonly destroyed: number;
  readonly died: number;
}

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

  return data ?? {
    saved: 0,
    destroyed: 0,
    died: 0,
  };
};

export { useStats };
