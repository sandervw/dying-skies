import { createContext } from "react";
import type { ReactElement, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../types/auth";
import { fetchCurrentUser, logout } from "../services/authService";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

/** drop the signed-in user and every query cached for them. */
const forgetUser = (queryClient: QueryClient): void => {
  queryClient.setQueryData(AUTH_QUERY_KEY, null);
  queryClient.removeQueries({ queryKey: ["stars", "mine"] });
};

/** the current user, session load state, sign-in setter, and sign-out. */
const AuthContext = createContext<{
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
}>({ user: null, isLoading: false, setUser: () => {}, signOut: async () => {} });

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
  const setUser = (user: AuthUser): void => {
    queryClient.setQueryData(AUTH_QUERY_KEY, user);
  };

  // end the Login on the server, then forget the user here.
  const signOut = async (): Promise<void> => {
    await logout();
    forgetUser(queryClient);
  };

  return (
    <AuthContext.Provider
      value={{ user: data ?? null, isLoading, setUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, forgetUser };
