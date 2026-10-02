import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./layout";

type Interval = "month" | "year";

function configuredPrice(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Display strings set at build time, so prerendered and hydrated markup match.
const PRO_PRICES: Record<Interval, string | null> = {
  month: configuredPrice(import.meta.env.VITE_PRICE_PRO_MONTHLY),
  year: configuredPrice(import.meta.env.VITE_PRICE_PRO_YEARLY),
};

const FREE_FEATURES = [
  "1 connected device",
  "The Free agents, skills, and rules",
  "Claude Code, Codex, Cursor, and Gemini CLI",
];

const PRO_FEATURES = [
  "Unlimited connected devices",
  "Every agent in the catalog, including Pro-only ones",
  "Cancel, change your payment method, and download invoices in the Stripe billing portal",
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-sm leading-6 text-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface PlanProps {
  id: string;
  name: string;
  aside?: ReactNode;
  /** One line under the plan name: the price, or how it is shown. */
  price: ReactNode;
  children?: ReactNode;
  action: ReactNode;
  className?: string;
}

function Plan({ id, name, aside, price, children, action, className }: PlanProps) {
  return (
    <li className="flex">
      <Card className={cn("flex w-full flex-col p-6 sm:p-8", className)} aria-labelledby={id}>
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <h3 id={id} className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-foreground">
            {name}
          </h3>
          {aside}
        </div>
        <div className="mt-2 min-h-12">{price}</div>
        {children}
        <div className="mt-auto pt-8">{action}</div>
      </Card>
    </li>
  );
}

/** Amounts appear only when both intervals are configured; otherwise Stripe shows the price. */
function ProPrice({ interval }: { interval: Interval | null }) {
  const amount = interval ? PRO_PRICES[interval] : null;
  return (
    <>
      {interval && amount ? (
        <p aria-live="polite" className="flex items-baseline gap-1.5 text-sm text-muted-foreground">
          <span className="text-base font-semibold text-foreground tabular">{amount}</span>
          {interval === "month" ? "per month" : "per year"}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Price shown at checkout</p>
      )}
      <p className="text-sm text-muted-foreground">Billed monthly or yearly</p>
    </>
  );
}

export function Pricing() {
  const [billingInterval, setBillingInterval] = useState<Interval>("month");
  const showToggle = PRO_PRICES.month !== null && PRO_PRICES.year !== null;

  return (
    <Section id="pricing" labelledBy="pricing-title">
      <SectionHeading id="pricing-title" title="Free for one machine. Pro for all of them.">
        Start on Free with one machine. Upgrade when you need more machines or the Pro-only agents in the catalog.
      </SectionHeading>

      <ul className="mt-14 grid gap-4 md:grid-cols-2">
        <Plan
          id="plan-free"
          name="Free"
          price={<p className="text-sm text-muted-foreground">No card required</p>}
          action={
            <Link to="/signup" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}>
              Create free account
            </Link>
          }
        >
          <FeatureList items={FREE_FEATURES} />
        </Plan>

        <Plan
          id="plan-pro"
          name="Pro"
          className="border-accent-border"
          aside={
            showToggle ? (
              <SegmentedControl<Interval>
                label="Billing interval"
                size="sm"
                value={billingInterval}
                onChange={setBillingInterval}
                options={[
                  { value: "month", label: "Monthly" },
                  { value: "year", label: "Yearly" },
                ]}
              />
            ) : null
          }
          price={<ProPrice interval={showToggle ? billingInterval : null} />}
          action={
            <Link to="/billing" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "w-full")}>
              Upgrade to Pro
            </Link>
          }
        >
          <FeatureList items={PRO_FEATURES} />
        </Plan>
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-4 sm:px-8">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Team</h3>
        <Badge variant="neutral">Coming soon</Badge>
      </div>
    </Section>
  );
}
