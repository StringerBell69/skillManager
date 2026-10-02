import { Navigate, useSearchParams } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { Seo } from "@/components/seo";
import { SITE_NAME } from "@/lib/site";
import { AuthCardSkeleton, AuthPage } from "@/components/auth/auth-page";
import { safeRedirectPath } from "@/lib/redirect";

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();
  const [params] = useSearchParams();

  // Already signed in: go where Clerk would have sent the user, never off-site.
  if (isLoaded && isSignedIn) return <Navigate to={safeRedirectPath(params.get("redirect_url"))} replace />;

  return (
    <AuthPage footer="Signing in lets you connect the CLI, manage devices, and change your plan.">
      <Seo title={`Sign in | ${SITE_NAME}`} noindex />
      <SignIn path="/login" signUpUrl="/signup" fallback={<AuthCardSkeleton />} />
    </AuthPage>
  );
}
