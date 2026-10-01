import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, ApiError } from "../lib/api";
import { useAuth } from "@clerk/clerk-react";
import { queryKeys } from "./queryKeys";

export function useApproveCli() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (userCode: string) => {
      return fetchApi<void>("/v1/cli/auth/approve", {
        method: "POST",
        body: JSON.stringify({ userCode }),
        getToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    },
  });
}
