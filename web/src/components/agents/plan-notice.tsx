import { Link } from "react-router-dom";
import { useBilling } from "@/hooks/useAccount";
import { pluralize } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";
import { QueryError } from "@/components/overview/query-error";
import { InlineCode } from "./inline-code";

/**
 * Tells people how many agents their plan leaves out. The catalog endpoint only
 * returns agents the plan includes, so the count comes from billing usage.
 */
export function PlanNotice() {
  const billing = useBilling();

  if (!billing.data) {
    if (!billing.isError) return null;
    return (
      <QueryError
        title="Could not load your plan"
        error={billing.error}
        onRetry={() => void billing.refetch()}
        retrying={billing.isFetching}
      />
    );
  }

  const { plan, usage } = billing.data;
  const locked = usage.agentsTotal - usage.agentsUnlocked;
  if (locked <= 0 || plan === "TEAM") return null;

  const verb = locked === 1 ? "is" : "are";

  if (plan === "FREE") {
    return (
      <Alert
        tone="info"
        title={`${pluralize(locked, "more agent")} ${verb} available on Pro.`}
        action={
          <Link to="/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Upgrade
          </Link>
        }
      >
        After you upgrade, the next <InlineCode>sm install</InlineCode> adds them to your project.
      </Alert>
    );
  }

  return (
    <Alert
      tone="info"
      title={`${pluralize(locked, "more agent")} ${verb} available on Team.`}
      action={
        <Link to="/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          View plans
        </Link>
      }
    />
  );
}
