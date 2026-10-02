import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiFetch, isApiError, type ApiRequestInit } from "@/lib/api";

/**
 * Returns a fetcher that attaches the signed-in user's Clerk session token.
 * On a 401 it retries once with a freshly minted token, which covers a token
 * that expired between being cached and being sent.
 */
export function useApi() {
  const { getToken } = useAuth();

  return useCallback(
    async <T,>(path: string, init: Omit<ApiRequestInit, "getToken"> = {}) => {
      try {
        return await apiFetch<T>(path, { ...init, getToken: () => getToken() });
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          return apiFetch<T>(path, { ...init, getToken: () => getToken({ skipCache: true }) });
        }
        throw error;
      }
    },
    [getToken],
  );
}
