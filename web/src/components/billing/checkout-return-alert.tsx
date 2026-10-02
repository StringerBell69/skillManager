import { X } from "lucide-react";
import type { Plan } from "@skillmanager/shared/browser";
import { planLabel } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CheckoutReturnAlertProps {
  result: "success" | "cancel";
  /** Current plan, or undefined while billing is still loading. */
  plan: Plan | undefined;
  /** True once we stopped waiting for Stripe to confirm the payment. */
  timedOut: boolean;
  onDismiss: () => void;
}

function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} aria-label="Dismiss" className="-my-1 -mr-2">
      <X aria-hidden />
    </Button>
  );
}

/** Shown when Stripe Checkout sends the visitor back with ?checkout=success or ?checkout=cancel. */
export function CheckoutReturnAlert({ result, plan, timedOut, onDismiss }: CheckoutReturnAlertProps) {
  if (result === "cancel") {
    return (
      <Alert tone="info" title="Checkout canceled" action={<DismissButton onClick={onDismiss} />}>
        You have not been charged.
      </Alert>
    );
  }

  const activated = plan !== undefined && plan !== "FREE";

  return (
    <Alert tone="success" title="Payment received" action={<DismissButton onClick={onDismiss} />}>
      {activated
        ? `Your ${planLabel(plan)} plan is active.`
        : timedOut
          ? "Stripe has not confirmed the payment yet. Reload this page in a minute to see your Pro plan."
          : "Your Pro plan becomes active as soon as Stripe confirms the payment. This usually takes a few seconds."}
    </Alert>
  );
}
