import { useQuery } from "@tanstack/react-query";
import { SAVED_SKIES_QUERY_KEY, fetchSavedTokens } from "../services/starApiService";
import { useAuth } from "./useAuth";

/** the signed-in user's Saved tokens, cached per user. */
const useSavedTokens = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SAVED_SKIES_QUERY_KEY, user?.id],
    queryFn: fetchSavedTokens,
    enabled: user !== null,
    // a 401 logs out at once; main.tsx logs every failure.
    retry: false,
  });
};

export { useSavedTokens };
