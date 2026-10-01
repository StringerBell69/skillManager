import { useMutation } from "@tanstack/react-query";
import { fetchApi, ApiError } from "../lib/api";
import { useAuth } from "@clerk/clerk-react";

export function useDenyCli() {
  const { getToken } = useAuth();

  return useMutation<void, ApiError, string>({
    mutationFn: async (userCode: string) => {
      return fetchApi<void>("/v1/cli/auth/deny", {
        method: "POST",
        body: JSON.stringify({ userCode }),
        getToken,
      });
    },
  });
}
