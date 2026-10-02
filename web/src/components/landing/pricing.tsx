import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Minus } from "lucide-react";
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

const SHOW_PRICES = PRO_PRICES.month !== null && PRO_PRICES.year !== null;

const FREE_FEATURES = [
  "1 connected device",
  "The Free agents, skills, and rules",
  "Claude Code, Codex, Cursor, and Gemini CLI",
  "Device list and revoke in the dashboard",
];

const PRO_FEATURES = [
  "Unlimited connected devices",
  "Every agent, skill, and rule, including Pro-only ones",
  "Claude Code, Codex, Cursor, and Gemini CLI",
  "Invoices and payment method in the Stripe billing portal",
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-sm leading-6 text-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-1 size-4 shrink-0 text-accent-text" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface PlanProps {
  id: string;
  name: string;
  heading: "h2" | "h3";
  aside?: ReactNode;
  price: ReactNode;
  children?: ReactNode;
  action: ReactNode;
  className?: string;
}

function Plan({ id, name, heading: Heading, aside, price, children, action, className }: PlanProps) {
  return (
    <li className="flex">
      <Card className={cn("flex w-full flex-col rounded-2xl p-6 sm:p-8", className)} aria-labelledby={id}>
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <Heading id={id} className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-foreground">
            {name}
          </Heading>
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
function ProPrice({ interval }: { interval: Interval }) {
  const amount = SHOW_PRICES ? PRO_PRICES[interval] : null;
  return (
    <>
      {amount ? (
        <p aria-live="polite" className="flex items-baseline gap-1.5 text-sm text-muted-foreground">
          <span className="text-[22px] font-semibold tracking-tight text-foreground tabular">{amount}</span>
          {interval === "month" ? "per month" : "per year"}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Price shown at checkout</p>
      )}
      <p className="text-sm text-muted-foreground">Billed monthly or yearly</p>
    </>
  );
}

/** Free and Pro cards, plus the Team row. Shared by the home page and /pricing. */
export function PlanCards({ className, heading = "h3" }: { className?: string; heading?: "h2" | "h3" }) {
  const Heading = heading;
  const [billingInterval, setBillingInterval] = useState<Interval>("month");

  return (
    <div className={className}>
      <ul className="grid gap-4 md:grid-cols-2">
        <Plan
          id="plan-free"
          name="Free"
          heading={heading}
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
          heading={heading}
          className="border-accent-border ring-1 ring-accent-border"
          aside={
            SHOW_PRICES ? (
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
            ) : (
              <Badge variant="accent">Unlimited machines</Badge>
            )
          }
          price={<ProPrice interval={billingInterval} />}
          action={
            <Link to="/billing" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "w-full")}>
              Upgrade to Pro
            </Link>
          }
        >
          <FeatureList items={PRO_FEATURES} />
        </Plan>
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-4 sm:px-8">
        <Heading className="text-[15px] font-semibold tracking-tight text-foreground">Team</Heading>
        <Badge variant="neutral">Coming soon</Badge>
      </div>
    </div>
  );
}

type Cell = boolean | string;

const COMPARISON: Array<{ group: string; rows: Array<{ label: string; free: Cell; pro: Cell }> }> = [
  {
    group: "Usage",
    rows: [
      { label: "Connected devices", free: "1", pro: "Unlimited" },
      { label: "Install, update, list, and remove from the CLI", free: true, pro: true },
      { label: "Preview with --dry-run", free: true, pro: true },
    ],
  },
  {
    group: "Catalog",
    rows: [
      { label: "Free agents, skills, and rules", free: true, pro: true },
      { label: "Pro-only agents, skills, and rules", free: false, pro: true },
    ],
  },
  {
    group: "Tools",
    rows: [
      { label: "Claude Code and Cursor (own files)", free: true, pro: true },
      { label: "Codex and Gemini CLI (marked sections)", free: true, pro: true },
    ],
  },
  {
    group: "Account",
    rows: [
      { label: "Device list and revoke in the dashboard", free: true, pro: true },
      { label: "Billing", free: "No card required", pro: "Monthly or yearly" },
      { label: "Invoices and payment method", free: false, pro: "Stripe billing portal" },
    ],
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-accent-text" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto size-4 text-faint-foreground" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-foreground">{value}</span>;
}

export function PlanComparison({ className }: { className?: string }) {
  return (
    // `relative` keeps the absolutely positioned screen reader labels inside the scroll container.
    <div
      tabIndex={0}
      role="region"
      aria-label="Plan comparison"
      className={cn("relative overflow-x-auto rounded-2xl border border-card-edge bg-surface shadow-card", className)}
    >
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">Compare the Free and Pro plans</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-1/2 px-5 py-4 text-left text-xs font-medium text-muted-foreground sm:px-6">
              Compare plans
            </th>
            <th scope="col" className="px-4 py-4 text-center text-[15px] font-semibold text-foreground">
              Free
            </th>
            <th scope="col" className="px-4 py-4 text-center text-[15px] font-semibold text-foreground">
              Pro
            </th>
          </tr>
        </thead>
        {COMPARISON.map(({ group, rows }) => (
          <tbody key={group}>
            <tr className="bg-subtle">
              <th scope="colgroup" colSpan={3} className="px-5 py-2 text-left text-xs font-medium text-muted-foreground sm:px-6">
                {group}
              </th>
            </tr>
            {rows.map(({ label, free, pro }) => (
              <tr key={label} className="border-t border-border">
                <th scope="row" className="px-5 py-3.5 text-left font-normal text-foreground sm:px-6">
                  {label}
                </th>
                <td className="px-4 py-3.5 text-center text-13">
                  <CellValue value={free} />
                </td>
                <td className="px-4 py-3.5 text-center text-13">
                  <CellValue value={pro} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export function Pricing() {
  return (
    <Section id="pricing" labelledBy="pricing-title">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="pricing-title" title="Free for one machine. Pro for all of them.">
          Start on Free with one machine. Upgrade when you add more machines or want the Pro-only agents in the catalog.
        </SectionHeading>
        <Link
          to="/pricing"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-md text-sm font-medium text-foreground underline-offset-4 hover:underline lg:self-auto"
        >
          Full pricing and billing FAQ
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <PlanCards className="mt-12 lg:mt-14" />
      <PlanComparison className="mt-10" />
    </Section>
  );
}
