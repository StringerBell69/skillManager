import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Seo } from "@/components/seo";
import { FullPageSpinner } from "@/components/ui/spinner";
import { AuthorizeDevice } from "@/components/cli/authorize-device";
import { InvalidCodeScreen, MissingCodeScreen } from "@/components/cli/result-screens";
import { SignInPrompt } from "@/components/cli/sign-in-prompt";
import { isValidUserCode, normalizeUserCode } from "@/components/cli/user-code";

/**
 * Device authorization for `sm login`. The CLI opens /cli?code=KPTW-4827 and
 * polls the API while the signed-in user approves or denies the code here.
 */
function CliAuthContent({ code }: { code: string }) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  // Both checks are local, so they render before Clerk finishes loading.
  if (!code) return <MissingCodeScreen />;
  if (!isValidUserCode(code)) return <InvalidCodeScreen />;

  if (!isLoaded) return <FullPageSpinner label="Checking your session…" />;
  if (!isSignedIn) return <SignInPrompt code={code} />;

  // Keyed so a different code, or a different account, starts from a clean approval state.
  return <AuthorizeDevice key={`${userId}:${code}`} code={code} />;
}

export default function CliAuth() {
  const [params] = useSearchParams();
  const code = normalizeUserCode(params.get("code"));

  return (
    <>
      <Seo title="Authorize the CLI | SkillManager" noindex />
      <CliAuthContent code={code} />
    </>
  );
}
