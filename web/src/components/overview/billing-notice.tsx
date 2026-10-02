import { Link } from "react-router-dom";
import type { BillingSummaryResponse } from "@skillmanager/shared/browser";
import { formatDate, planLabel } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";

/** Payment problems and cancellations, shown above the summary. Renders nothing when billing is in good standing. */
export function BillingNotice({ billing }: { billing: BillingSummaryResponse }) {
  const paid = billing.plan !== "FREE";
  const plan = planLabel(billing.plan);

  if (billing.status === "PAST_DUE") {
    return (
      <Alert
        tone="warning"
        title="Your last payment did not go through"
        action={
          <Link to="/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Update payment method
          </Link>
        }
      >
        {paid
          ? `Update your payment method to keep ${plan} features.`
          : "Update your payment method to keep your paid features."}
      </Alert>
    );
  }

  if (billing.status === "CANCELED" && paid) {
    return (
      <Alert
        tone="info"
        title={
          billing.currentPeriodEnd
            ? `Your ${plan} plan ends on ${formatDate(billing.currentPeriodEnd)}`
            : `Your ${plan} plan is canceled`
        }
        action={
          <Link to="/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Review billing
          </Link>
        }
      >
        {billing.currentPeriodEnd
          ? `You keep ${plan} features until then. Subscribe again from Billing to keep them after that date.`
          : `Subscribe again from Billing to keep ${plan} features.`}
      </Alert>
    );
  }

  return null;
}
