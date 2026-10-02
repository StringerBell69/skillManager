import { Navigate } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { Seo, SITE_NAME } from "@/components/seo";
import { AuthCardSkeleton, AuthPage } from "@/components/auth/auth-page";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    <AuthPage footer="The Free plan includes one connected device. No card required.">
      <Seo title={`Create your account | ${SITE_NAME}`} noindex />
      <SignUp path="/signup" signInUrl="/login" fallback={<AuthCardSkeleton />} />
    </AuthPage>
  );
}
