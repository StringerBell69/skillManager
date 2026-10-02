import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useApproveCli, useDenyCli } from "@/hooks/useAccount";
import { Button } from "@/components/ui/button";
import { CliFrame, CliHeading } from "./cli-frame";
import { DeviceCode } from "./device-code";
import {
  ApprovedScreen,
  DeniedScreen,
  DeviceLimitScreen,
  ExpiredCodeScreen,
  FailureScreen,
  UnusableCodeScreen,
} from "./result-screens";
import { cliPath } from "./user-code";

/**
 * Screen readers lose their place when the clicked button unmounts, so move
 * focus to the new heading whenever the result changes.
 */
function useFocusHeadingOnChange(key: string) {
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    document.querySelector<HTMLElement>("[data-page-title]")?.focus({ preventScroll: true });
  }, [key]);
}

/** Signed-in approval for one validated code. */
export function AuthorizeDevice({ code }: { code: string }) {
  const { user } = useUser();
  const clerk = useClerk();
  const approve = useApproveCli();
  const deny = useDenyCli();
  const [signingOut, setSigningOut] = useState(false);

  const result = approve.isSuccess
    ? "approved"
    : approve.isError
      ? `approve-error:${approve.error.code}`
      : deny.isSuccess
        ? "denied"
        : deny.isError
          ? `deny-error:${deny.error.code}`
          : "pending";
  useFocusHeadingOnChange(result);

  const signOut = () => {
    setSigningOut(true);
    clerk.signOut({ redirectUrl: cliPath(code) }).catch(() => setSigningOut(false));
  };

  if (approve.isSuccess) return <ApprovedScreen />;

  if (approve.isError) {
    const error = approve.error;
    switch (error.code) {
      case "DEVICE_CODE_EXPIRED":
        return <ExpiredCodeScreen />;
      case "USER_CODE_INVALID":
        return <UnusableCodeScreen message={error.message} />;
      case "DEVICE_LIMIT_REACHED":
        return <DeviceLimitScreen error={error} code={code} onRetry={() => approve.reset()} />;
      default:
        return (
          <FailureScreen
            title="Authorization failed"
            error={error}
            onRetry={() => approve.reset()}
            onSignInAgain={signOut}
            signingOut={signingOut}
          />
        );
    }
  }

  if (deny.isSuccess) return <DeniedScreen />;

  if (deny.isError) {
    const error = deny.error;
    if (error.code === "USER_CODE_INVALID") return <UnusableCodeScreen message={error.message} />;
    return (
      <FailureScreen
        title="Could not deny the request"
        error={error}
        onRetry={() => deny.reset()}
        onSignInAgain={signOut}
        signingOut={signingOut}
      />
    );
  }

  const busy = approve.isPending || deny.isPending || signingOut;
  const account = user?.primaryEmailAddress?.emailAddress ?? user?.username ?? null;

  return (
    <CliFrame>
      <CliHeading
        title="Authorize the SkillManager CLI"
        description="Check that this code matches the one shown in your terminal. Only approve codes you requested."
      />

      <DeviceCode
        code={code}
        className="mt-5"
        footer={
          <>
            <p className="min-w-0 text-13 text-muted-foreground">
              {account ? (
                <>
                  Signed in as <span className="font-medium text-foreground wrap-anywhere">{account}</span>
                </>
              ) : (
                "You are signed in"
              )}
            </p>
            <Button variant="link" size="sm" className="min-h-6" onClick={signOut} disabled={busy}>
              {signingOut ? "Signing out…" : "Use another account"}
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="accent"
          className="h-10 sm:h-9"
          onClick={() => approve.mutate(code)}
          loading={approve.isPending}
          disabled={busy}
        >
          {approve.isPending ? "Authorizing…" : "Authorize device"}
        </Button>
        <Button
          variant="secondary"
          className="h-10 sm:h-9"
          onClick={() => deny.mutate(code)}
          loading={deny.isPending}
          disabled={busy}
        >
          {deny.isPending ? "Denying…" : "Deny"}
        </Button>
      </div>
      <p className="sr-only" role="status">
        {approve.isPending ? "Authorizing device…" : deny.isPending ? "Denying request…" : ""}
      </p>

      <p className="mt-6 text-13 text-muted-foreground">
        Approving signs the CLI in to your account. The device then shows on your Devices page, where you can revoke it
        at any time.
      </p>
    </CliFrame>
  );
}
