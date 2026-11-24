import { createContext } from "react";
import type { ReactElement, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../types/auth";
import * as authService from "../services/authService";
import { SAVED_SKIES_QUERY_KEY } from "../services/starApiService";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

/** drop the signed-in user and every query cached for them. */
const forgetUser = (queryClient: QueryClient): void => {
  queryClient.setQueryData(AUTH_QUERY_KEY, null);
  queryClient.removeQueries({ queryKey: SAVED_SKIES_QUERY_KEY });
};

/** the current user, session load state, sign-in setter, and logout. */
const AuthContext = createContext<{
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}>({ user: null, isLoading: false, setUser: () => {}, logout: async () => {} });

/** provides the current user; the session is fetched once and cached. */
const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.fetchCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  // update the cached session so every consumer re-renders.
  const setUser = (user: AuthUser): void => {
    queryClient.setQueryData(AUTH_QUERY_KEY, user);
  };

  // end the Login on the server, then forget the user here.
  const logout = async (): Promise<void> => {
    await authService.logout();
    forgetUser(queryClient);
  };

  return (
    <AuthContext.Provider
      value={{ user: data ?? null, isLoading, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, forgetUser };
