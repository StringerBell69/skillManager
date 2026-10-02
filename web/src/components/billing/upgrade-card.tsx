import { useRef, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { useCheckout } from "@/hooks/useAccount";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Interval = "month" | "year";

const FEATURES = [
  "Unlimited connected devices",
  "Every agent, skill, and rule in the catalog, including Pro-only ones",
  "Monthly or yearly billing",
  "Cancel anytime from the billing portal",
];

/** Display prices are configured at build time. Without them, Stripe Checkout shows the price. */
const PRICES: Record<Interval, string | undefined> = {
  month: import.meta.env.VITE_PRICE_PRO_MONTHLY?.trim() || undefined,
  year: import.meta.env.VITE_PRICE_PRO_YEARLY?.trim() || undefined,
};

/**
 * Recorded server side, word for word, as the English waiver text (locale "en").
 * Do not edit without updating WITHDRAWAL_WAIVER_TEXTS in the API.
 */
const WAIVER_TEXT = "By subscribing, I expressly waive my 14-day withdrawal right so the subscription can start immediately.";

const WAIVER_ID = "withdrawal-waiver";
const WAIVER_ERROR_ID = "withdrawal-waiver-error";

export function UpgradeCard() {
  const checkout = useCheckout();
  const [interval, setBillingInterval] = useState<Interval>("month");
  const [waived, setWaived] = useState(false);
  const [showWaiverError, setShowWaiverError] = useState(false);
  const waiverRef = useRef<HTMLInputElement>(null);

  const price = PRICES[interval];
  // Stay busy after success too: the hook is already navigating to Stripe.
  const redirecting = checkout.isPending || checkout.isSuccess;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!waived) {
      setShowWaiverError(true);
      waiverRef.current?.focus();
      return;
    }
    checkout.mutate({ plan: "PRO", interval, waiveWithdrawal: true, locale: "en" });
  };

  return (
    <Card aria-labelledby="upgrade-title">
      <form onSubmit={onSubmit} noValidate>
        <CardHeader>
          <div>
            <CardTitle id="upgrade-title">Pro</CardTitle>
            <CardDescription>
              For people who use SkillManager on more than one machine or want every agent in the catalog.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <SegmentedControl<Interval>
              label="Billing interval"
              value={interval}
              onChange={setBillingInterval}
              options={[
                { value: "month", label: "Monthly" },
                { value: "year", label: "Yearly" },
              ]}
            />
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {price ? (
                <>
                  <span className="text-xl font-semibold tracking-tight tabular text-foreground">{price}</span>{" "}
                  {interval === "month" ? "per month" : "per year"}
                </>
              ) : (
                "Price shown at checkout"
              )}
            </p>
          </div>

          <div>
            <div className="flex items-start gap-2.5">
              <input
                ref={waiverRef}
                id={WAIVER_ID}
                type="checkbox"
                checked={waived}
                onChange={(event) => {
                  setWaived(event.target.checked);
                  if (event.target.checked) setShowWaiverError(false);
                }}
                aria-invalid={showWaiverError || undefined}
                aria-describedby={showWaiverError ? WAIVER_ERROR_ID : undefined}
                className="mt-0.5 size-4 shrink-0 cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
              <label htmlFor={WAIVER_ID} className="cursor-pointer text-13 text-foreground">
                {WAIVER_TEXT}
              </label>
            </div>
            {showWaiverError ? (
              <p id={WAIVER_ERROR_ID} className="mt-1.5 pl-[26px] text-13 text-danger">
                Confirm this to continue to checkout.
              </p>
            ) : null}
          </div>

          {checkout.isError ? (
            <Alert tone="danger" title="Could not start checkout">
              {checkout.error.message || "Something went wrong on our side. Try again in a moment."}
            </Alert>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch sm:flex-row sm:items-center sm:gap-4">
          <Button type="submit" variant="accent" loading={redirecting} className="h-10 sm:h-9">
            Continue to checkout
          </Button>
          <p className="text-13 text-muted-foreground">Payment happens on the Stripe checkout page.</p>
        </CardFooter>
      </form>
    </Card>
  );
}
