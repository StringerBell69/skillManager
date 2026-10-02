import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBilling, useBillingPortal } from "@/hooks/useAccount";
import { planLabel } from "@/lib/format";
import { AppSeo } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CheckoutReturnAlert } from "@/components/billing/checkout-return-alert";
import { CurrentPlanCard, CurrentPlanCardSkeleton } from "@/components/billing/current-plan-card";
import { InvoicesCard, InvoicesCardSkeleton } from "@/components/billing/invoices-card";
import { UpgradeCard } from "@/components/billing/upgrade-card";
import { UsageCard, UsageCardSkeleton } from "@/components/billing/usage-card";
import { useActivationPolling } from "@/components/billing/use-activation-polling";

type PortalSource = "past-due" | "plan-card";

export default function Billing() {
  const billing = useBilling();
  const portal = useBillingPortal();
  const [portalSource, setPortalSource] = useState<PortalSource | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutParam = searchParams.get("checkout");
  const checkoutResult = checkoutParam === "success" || checkoutParam === "cancel" ? checkoutParam : null;

  // Captured once, so dismissing the alert does not stop the wait for Stripe.
  const [awaitingActivation] = useState(() => checkoutParam === "success");
  const data = billing.data;
  const timedOut = useActivationPolling(awaitingActivation && data?.plan === "FREE", billing.refetch);

  const dismissCheckout = () => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("checkout");
        return next;
      },
      { replace: true },
    );
  };

  // The hook redirects to Stripe on success, so stay busy until the page unloads.
  const portalBusy = portal.isPending || portal.isSuccess;
  const openPortal = (source: PortalSource) => {
    setPortalSource(source);
    portal.mutate();
  };

  const pastDue = data?.status === "PAST_DUE";

  return (
    <>
      <AppSeo title="Billing" />
      <div className="flex flex-col gap-8">
        <PageHeader title="Billing" description="Your plan, payment details, and invoices." />

        {checkoutResult || pastDue ? (
          <div className="flex flex-col gap-3">
            {checkoutResult ? (
              <CheckoutReturnAlert result={checkoutResult} plan={data?.plan} timedOut={timedOut} onDismiss={dismissCheckout} />
            ) : null}
            {data && pastDue ? (
              <Alert
                tone="warning"
                title="Your last payment did not go through"
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openPortal("past-due")}
                    loading={portalBusy && portalSource === "past-due"}
                    disabled={portalBusy}
                  >
                    Update payment method
                  </Button>
                }
              >
                Update your payment method in the Stripe billing portal to keep your {planLabel(data.plan)} plan.
              </Alert>
            ) : null}
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex flex-col gap-6">
                <CurrentPlanCard
                  billing={data}
                  onManage={() => openPortal("plan-card")}
                  managing={portalBusy && portalSource === "plan-card"}
                  disabled={portalBusy}
                  portalError={portal.error}
                />
                {data.plan === "FREE" ? (
                  <div>
                    <UpgradeCard />
                    <p className="mt-3 text-13 text-muted-foreground">Team plan: coming soon.</p>
                  </div>
                ) : null}
              </div>
              <UsageCard usage={data.usage} plan={data.plan} />
            </div>

            <InvoicesCard invoices={data.invoices} />
          </>
        ) : billing.isError ? (
          <Alert
            tone="danger"
            title="Could not load billing"
            action={
              <Button variant="secondary" size="sm" onClick={() => void billing.refetch()} loading={billing.isFetching}>
                Try again
              </Button>
            }
          >
            {billing.error.message || "Something went wrong on our side. Try again in a moment."}
          </Alert>
        ) : (
          <>
            <span className="sr-only" role="status">
              Loading billing…
            </span>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <CurrentPlanCardSkeleton />
              <UsageCardSkeleton />
            </div>
            <InvoicesCardSkeleton />
          </>
        )}
      </div>
    </>
  );
}
