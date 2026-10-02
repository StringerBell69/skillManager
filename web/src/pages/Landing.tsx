import { Seo } from "@/components/seo";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { Pricing } from "@/components/landing/pricing";
import { StructuredData } from "@/components/landing/structured-data";
import { ToolsSection } from "@/components/landing/tools-section";

/*
 * Prerendered at build time and hydrated in the browser, so rendering must be
 * deterministic: no window, storage, clock, or random values during render.
 * This route sits outside ClerkProvider and QueryClientProvider.
 */
export default function Landing() {
  return (
    <MarketingLayout>
      <Seo
        title="SkillManager: AI agents for Claude Code, Codex, and Cursor"
        description="Install AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI with one command. Free plan for one machine, no card required."
        path="/"
      />
      <StructuredData />
      <Hero />
      <HowItWorks />
      <Features />
      <ToolsSection />
      <Pricing />
      <Faq />
      <ClosingCta />
    </MarketingLayout>
  );
}
