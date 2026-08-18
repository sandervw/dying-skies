import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../types/auth";
import { fetchCurrentUser } from "../services/authService";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface Auth {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly setUser: (user: AuthUser | null) => void;
}

/** expose the current user and a setter that updates the cached session. */
const useAuth = (): Auth => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  const setUser = (user: AuthUser | null): void => {
    queryClient.setQueryData(AUTH_QUERY_KEY, user);
  };

  return { user: data ?? null, isLoading, setUser };
};

export { useAuth };
