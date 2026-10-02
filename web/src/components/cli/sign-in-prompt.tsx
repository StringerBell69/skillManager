import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { CliFrame, CliHeading } from "./cli-frame";
import { DeviceCode } from "./device-code";
import { cliPath } from "./user-code";

/** Signed-out visitors sign in or sign up, then land back here with the same code. */
export function SignInPrompt({ code }: { code: string }) {
  const returnTo = cliPath(code);

  return (
    <CliFrame>
      <CliHeading title="Sign in to authorize the CLI" description="Your terminal is waiting for approval of this code:" />
      <DeviceCode code={code} className="mt-5" />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <SignInButton mode="redirect" forceRedirectUrl={returnTo} signUpForceRedirectUrl={returnTo}>
          <Button variant="primary" className="h-10 sm:h-9">
            Sign in to continue
          </Button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl={returnTo} signInForceRedirectUrl={returnTo}>
          <Button variant="secondary" className="h-10 sm:h-9">
            Create an account
          </Button>
        </SignUpButton>
      </div>
    </CliFrame>
  );
}
