import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ClerkFailed, ClerkProvider, useAuth } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { createClerkRouter } from "@/lib/clerk-nav";
import { PostHogIdentify } from "@/components/analytics/posthog-identify";
import { StatusScreen } from "@/components/status-screen";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const KEY_IS_VALID =
  typeof PUBLISHABLE_KEY === "string" &&
  /^pk_(test|live)_[A-Za-z0-9+/=_-]+$/.test(PUBLISHABLE_KEY);

/** Drop cached account data whenever the signed-in user changes or signs out. */
function ClearCacheOnUserChange() {
  const { isLoaded, userId } = useAuth();
  const previous = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    if (previous.current !== undefined && previous.current !== userId) {
      queryClient.clear();
    }
    previous.current = userId ?? null;
  }, [isLoaded, userId]);

  return null;
}

/** Wraps every route that needs authentication. Kept off the landing page to keep it light. */
export default function AuthLayout() {
  const navigate = useNavigate();
  const { routerPush, routerReplace } = createClerkRouter(navigate);

  if (!KEY_IS_VALID) {
    return (
      <StatusScreen
        tone="danger"
        title="Sign-in is not configured"
        description={
          <>
            Set <code className="font-mono text-[13px]">VITE_CLERK_PUBLISHABLE_KEY</code> to the
            publishable key from your Clerk dashboard, then rebuild the site.
          </>
        }
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={routerPush}
      routerReplace={routerReplace}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <QueryClientProvider client={queryClient}>
        <ClearCacheOnUserChange />
        <PostHogIdentify />
        <ClerkFailed>
          <StatusScreen
            overlay
            tone="danger"
            title="Sign-in could not load"
            description="The authentication service did not respond. Check your connection or disable content blockers for this site, then reload the page."
          />
        </ClerkFailed>
        <Outlet />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
