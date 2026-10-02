import { Code, CONTAINER, Section, SectionHeading } from "@/components/landing/layout";
import { ClosingCta } from "@/components/landing/closing-cta";
import { FaqList, type FaqItem } from "@/components/landing/faq";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { PlanCards, PlanComparison } from "@/components/landing/pricing";
import { Seo } from "@/components/seo";

const BILLING_FAQ: FaqItem[] = [
  {
    question: "When does Pro start?",
    answer:
      "Right after checkout. Stripe confirms the payment and your plan switches to Pro, usually within a few seconds. The Billing page updates on its own.",
  },
  {
    question: "Why does checkout ask me to waive my withdrawal right?",
    answer:
      "EU law gives you 14 days to withdraw from an online purchase. Pro starts immediately, so checkout asks you to confirm that you waive that right. Your confirmation is recorded with your subscription.",
  },
  {
    question: "How do I change my payment method or cancel?",
    answer:
      "Open Billing in the dashboard and choose Manage subscription. It opens the Stripe billing portal, where you can update your card, download invoices, and cancel.",
  },
  {
    question: "Where are my invoices?",
    answer: "Your recent invoices are listed on the Billing page with a PDF link for each, and all of them are in the Stripe billing portal.",
  },
  {
    question: "Does SkillManager store my card details?",
    answer: "No. Payment happens on Stripe Checkout, and SkillManager never receives your card number.",
  },
  {
    question: "How many machines can I connect on Free?",
    answer: (
      <>
        One. If you run <Code>sm login</Code> on a second machine, the approval page tells you the limit is reached
        and offers to revoke a device or upgrade. Pro has no device limit.
      </>
    ),
  },
  {
    question: "What does Team include?",
    answer: "Team is not available yet.",
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <Seo
        title="Pricing | SkillManager"
        description="Free covers one machine and the Free catalog. Pro adds unlimited machines and every agent, skill, and rule. No card required to start."
        path="/pricing"
      />

      <section aria-labelledby="pricing-page-title" className="pb-20 pt-12 sm:pb-24 sm:pt-20">
        <div className={CONTAINER}>
          <h1
            id="pricing-page-title"
            className="max-w-[18ch] text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[56px]"
          >
            Start free. Upgrade when you add a machine.
          </h1>
          <p className="mt-6 max-w-[56ch] text-base leading-7 text-muted-foreground sm:text-[17px]">
            Free covers one machine and the Free catalog. Pro adds unlimited machines and every agent, skill, and rule in
            the catalog.
          </p>
          <PlanCards className="mt-12 sm:mt-14" heading="h2" />
        </div>
      </section>

      <Section labelledBy="compare-title">
        <SectionHeading id="compare-title" title="Compare plans" />
        <PlanComparison className="mt-10" />
      </Section>

      <Section id="billing-faq" labelledBy="billing-faq-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <SectionHeading id="billing-faq-title" title="Billing questions" />
          <FaqList items={BILLING_FAQ} />
        </div>
      </Section>

      <ClosingCta />
    </MarketingLayout>
  );
}
