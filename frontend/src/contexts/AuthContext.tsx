import { createContext } from "react";
import type { ReactElement, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../types/auth";
import { fetchCurrentUser } from "../services/authService";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

/** the current user, session load state, and a cache-backed setter. */
const AuthContext = createContext<{
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
}>({ user: null, isLoading: false, setUser: () => {} });

/** provides the current user; the session is fetched once and cached. */
const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  // update the cached session so every consumer re-renders.
  const setUser = (user: AuthUser | null): void => {
    queryClient.setQueryData(AUTH_QUERY_KEY, user);
  };

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
