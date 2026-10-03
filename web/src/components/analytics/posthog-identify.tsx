import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { identifyUser, resetPostHog } from "@/lib/posthog";

/**
 * Links the PostHog anonymous session to the Clerk user once signed in, and
 * resets analytics when the session ends (including UserButton sign-out).
 */
export function PostHogIdentify() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const previous = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      identifyUser(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      });
    } else if (previous.current) {
      resetPostHog();
    }

    previous.current = userId ?? null;
  }, [isLoaded, userId, user?.fullName, user?.primaryEmailAddress?.emailAddress]);

  return null;
}
