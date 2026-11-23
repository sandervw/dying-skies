import { useQuery } from "@tanstack/react-query";
import { fetchMyStars } from "../services/starApiService";
import { useAuth } from "./useAuth";

/** the signed-in user's Saved tokens, cached per user. */
const useSavedTokens = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stars", "mine", user?.id],
    queryFn: fetchMyStars,
    enabled: user !== null,
    // a 401 signs out at once; other failures read as empty.
    retry: false,
  });
};

export { useSavedTokens };
