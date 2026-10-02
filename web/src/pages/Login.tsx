import { Navigate } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { Seo, SITE_NAME } from "@/components/seo";
import { AuthCardSkeleton, AuthPage } from "@/components/auth/auth-page";

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    <AuthPage footer="Signing in lets you connect the CLI, manage devices, and change your plan.">
      <Seo title={`Sign in | ${SITE_NAME}`} noindex />
      <SignIn path="/login" signUpUrl="/signup" fallback={<AuthCardSkeleton />} />
    </AuthPage>
  );
}
