import { Navigate, useSearchParams } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { Seo } from "@/components/seo";
import { SITE_NAME } from "@/lib/site";
import { AuthCardSkeleton, AuthPage } from "@/components/auth/auth-page";
import { safeRedirectPath } from "@/lib/redirect";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [params] = useSearchParams();

  // Already signed in: go where Clerk would have sent the user, never off-site.
  if (isLoaded && isSignedIn) return <Navigate to={safeRedirectPath(params.get("redirect_url"))} replace />;

  return (
    <AuthPage footer="The Free plan includes one connected device. No card required.">
      <Seo title={`Create your account | ${SITE_NAME}`} noindex />
      <SignUp path="/signup" signInUrl="/login" fallback={<AuthCardSkeleton />} />
    </AuthPage>
  );
}
