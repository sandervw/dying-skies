import { useQuery } from "@tanstack/react-query";
import { SAVED_STARS_QUERY_KEY, fetchMyStars } from "../services/starApiService";
import { useAuth } from "./useAuth";

/** the signed-in user's Saved tokens, cached per user. */
const useSavedTokens = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SAVED_STARS_QUERY_KEY, user?.id],
    queryFn: fetchMyStars,
    enabled: user !== null,
    // a 401 signs out at once; main.tsx logs every failure.
    retry: false,
  });
};

export { useSavedTokens };
