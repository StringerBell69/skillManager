import { Seo } from "@/components/seo";
import { ClosingCta } from "@/components/landing/closing-cta";
import { DetailsSection } from "@/components/landing/details-section";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StructuredData } from "@/components/landing/structured-data";
import { ToolsSection } from "@/components/landing/tools-section";

/*
 * Prerendered at build time and hydrated in the browser, so rendering must be
 * deterministic: no window, storage, clock, or random values during render.
 * This route sits outside ClerkProvider and QueryClientProvider.
 */
export default function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Seo
        title="SkillManager: AI agents for Claude Code, Codex, and Cursor"
        description="Install AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI with one command. Free plan for one machine, no card required."
        path="/"
      />
      <StructuredData />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        <HowItWorks />
        <ToolsSection />
        <DetailsSection />
        <Pricing />
        <Faq />
        <ClosingCta />
      </main>

      <SiteFooter />
    </div>
  );
}
