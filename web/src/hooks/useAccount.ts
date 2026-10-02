import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type {
  BillingSummaryResponse,
  DevicesResponse,
  PackListItem,
  UnlockedAgent,
} from "@skillmanager/shared/browser";
import type { ApiError } from "@/lib/api";
import { useApi } from "./useApi";
import { queryKeys } from "./queryKeys";

export function useBilling() {
  const api = useApi();
  const { userId, isSignedIn } = useAuth();
  return useQuery<BillingSummaryResponse, ApiError>({
    queryKey: [...queryKeys.billing, userId],
    enabled: isSignedIn === true,
    queryFn: () => api<BillingSummaryResponse>("/v1/me/billing"),
  });
}

export function useDevices() {
  const api = useApi();
  const { userId, isSignedIn } = useAuth();
  return useQuery<DevicesResponse, ApiError>({
    queryKey: [...queryKeys.devices, userId],
    enabled: isSignedIn === true,
    queryFn: () => api<DevicesResponse>("/v1/me/devices"),
    // Activity status is time based, so keep it reasonably fresh.
    refetchInterval: 60_000,
  });
}

export function useCatalogAgents() {
  const api = useApi();
  const { userId, isSignedIn } = useAuth();
  return useQuery<UnlockedAgent[], ApiError>({
    queryKey: [...queryKeys.catalogAgents, userId],
    enabled: isSignedIn === true,
    queryFn: () => api<UnlockedAgent[]>("/v1/me/catalog/agents"),
  });
}

export function useCatalogPacks() {
  const api = useApi();
  const { userId, isSignedIn } = useAuth();
  return useQuery<PackListItem[], ApiError>({
    queryKey: [...queryKeys.catalogPacks, userId],
    enabled: isSignedIn === true,
    queryFn: () => api<PackListItem[]>("/v1/me/catalog/packs"),
  });
}

export function useRevokeDevice() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<{ revoked: boolean }, ApiError, string>({
    mutationFn: (deviceId) =>
      api(`/v1/me/devices/${encodeURIComponent(deviceId)}`, { method: "DELETE" }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
    },
  });
}

export interface CheckoutInput {
  plan: "PRO";
  interval: "month" | "year";
  waiveWithdrawal: boolean;
  /** Locale of the waiver text the user agreed to, recorded server side. */
  locale: "en" | "fr";
}

export function useCheckout() {
  const api = useApi();
  return useMutation<{ url: string }, ApiError, CheckoutInput>({
    mutationFn: (input) => api("/v1/me/billing/checkout", { method: "POST", json: input }),
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

export function useBillingPortal() {
  const api = useApi();
  return useMutation<{ url: string }, ApiError, void>({
    mutationFn: () => api("/v1/me/billing/portal", { method: "POST" }),
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

export function useApproveCli() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<{ approved: boolean }, ApiError, string>({
    mutationFn: (userCode) => api("/v1/cli/auth/approve", { method: "POST", json: { userCode } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing });
    },
  });
}

export function useDenyCli() {
  const api = useApi();
  return useMutation<{ denied: boolean }, ApiError, string>({
    mutationFn: (userCode) => api("/v1/cli/auth/deny", { method: "POST", json: { userCode } }),
  });
}
