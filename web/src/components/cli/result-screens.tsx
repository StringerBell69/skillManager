import { Link } from "react-router-dom";
import { MonitorSmartphone } from "lucide-react";
import type { ApiError } from "@/lib/api";
import { planLabel, pluralize } from "@/lib/format";
import { StatusScreen } from "@/components/status-screen";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Command } from "@/components/ui/command";
import { InlineCode } from "./cli-frame";
import { cliPath } from "./user-code";

function LoginCommand() {
  return <Command command="sm login" label="Copy sm login command" />;
}

/** API messages often lack a final period. */
function asSentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function MissingCodeScreen() {
  return (
    <StatusScreen
      title="Open this page from the CLI"
      description={
        <>
          Run <InlineCode>sm login</InlineCode> in your terminal. It opens this page with a one-time code.
        </>
      }
    >
      <LoginCommand />
    </StatusScreen>
  );
}

export function InvalidCodeScreen() {
  return (
    <StatusScreen
      tone="danger"
      title="This code is not valid"
      description={
        <>
          Codes look like <InlineCode>KPTW-4827</InlineCode>. Run <InlineCode>sm login</InlineCode> again to get a new
          one.
        </>
      }
    >
      <LoginCommand />
    </StatusScreen>
  );
}

export function ApprovedScreen() {
  return (
    <StatusScreen
      tone="success"
      title="Device authorized"
      description="Return to your terminal. The CLI finishes signing in by itself, and you can close this tab."
      actions={
        <Link to="/dashboard" className={buttonVariants({ variant: "secondary" })}>
          Go to dashboard
        </Link>
      }
    />
  );
}

export function DeniedScreen() {
  return (
    <StatusScreen
      tone="muted"
      title="Request denied"
      description={
        <>
          The CLI was not signed in. If this was a mistake, run <InlineCode>sm login</InlineCode> again.
        </>
      }
    >
      <LoginCommand />
    </StatusScreen>
  );
}

export function ExpiredCodeScreen() {
  return (
    <StatusScreen
      tone="danger"
      title="This code has expired"
      description={
        <>
          Codes are valid for a few minutes. Run <InlineCode>sm login</InlineCode> again to get a new one.
        </>
      }
    >
      <LoginCommand />
    </StatusScreen>
  );
}

/** The code was never issued, has already been approved or denied, or was cleaned up after expiring. */
export function UnusableCodeScreen({ message }: { message: string }) {
  return (
    <StatusScreen
      tone="danger"
      title="This code can no longer be used"
      description={
        <>
          {asSentence(message)} Run <InlineCode>sm login</InlineCode> again to get a new one.
        </>
      }
    >
      <LoginCommand />
    </StatusScreen>
  );
}

interface DeviceLimitDetails {
  plan: "FREE" | "PRO" | "TEAM";
  limit: number;
}

function readDeviceLimitDetails(details: unknown): DeviceLimitDetails | null {
  if (!details || typeof details !== "object") return null;
  const { plan, limit } = details as { plan?: unknown; limit?: unknown };
  if (plan !== "FREE" && plan !== "PRO" && plan !== "TEAM") return null;
  if (typeof limit !== "number" || !Number.isFinite(limit)) return null;
  return { plan, limit };
}

interface DeviceLimitScreenProps {
  error: ApiError;
  code: string;
  /** Returns to the approval screen with the same code. */
  onRetry: () => void;
}

export function DeviceLimitScreen({ error, code, onRetry }: DeviceLimitScreenProps) {
  const details = readDeviceLimitDetails(error.details);
  // The API message names the plan as "FREE"; rebuild it with the display label when the details allow.
  const message = details
    ? `Your ${planLabel(details.plan)} plan allows ${pluralize(details.limit, "connected device")}. Revoke one from the Devices page before adding another.`
    : asSentence(error.message);
  const canUpgrade = !details || details.plan === "FREE";

  return (
    <StatusScreen
      icon={MonitorSmartphone}
      title="Device limit reached"
      description={
        <>
          <p>{message}</p>
          <p className="mt-2">
            After you revoke a device, come back to this page and{" "}
            <Link
              to={cliPath(code)}
              replace
              onClick={onRetry}
              className="font-medium text-accent-text underline underline-offset-4"
            >
              try again
            </Link>{" "}
            while the code is still valid.
          </p>
        </>
      }
      actions={
        <>
          <Link to="/devices" className={buttonVariants({ variant: "primary" })}>
            Manage devices
          </Link>
          {canUpgrade ? (
            <Link to="/billing" className={buttonVariants({ variant: "secondary" })}>
              Upgrade to Pro
            </Link>
          ) : null}
        </>
      }
    />
  );
}

function failureMessage(error: ApiError): string {
  switch (error.code) {
    // The rate limiter replies with a framework message, not a sentence meant for people.
    case "RATE_LIMITED":
      return "Too many attempts in a short time. Wait a minute, then try again.";
    case "UNAUTHORIZED":
      return "SkillManager could not verify your session. Try again, or sign in again if it keeps failing.";
    default:
      return asSentence(error.message);
  }
}

interface FailureScreenProps {
  title: string;
  error: ApiError;
  onRetry: () => void;
  onSignInAgain: () => void;
  signingOut: boolean;
}

export function FailureScreen({ title, error, onRetry, onSignInAgain, signingOut }: FailureScreenProps) {
  const sessionProblem = error.code === "UNAUTHORIZED";

  return (
    <StatusScreen
      tone="danger"
      title={title}
      description={failureMessage(error)}
      actions={
        <>
          <Button variant="primary" onClick={onRetry} disabled={signingOut}>
            Try again
          </Button>
          {sessionProblem ? (
            <Button variant="secondary" onClick={onSignInAgain} loading={signingOut}>
              Sign in again
            </Button>
          ) : null}
        </>
      }
    />
  );
}
