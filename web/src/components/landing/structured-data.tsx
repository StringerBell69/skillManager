import { SEO_FAQ } from "@/lib/seo-content";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const HOME = `${SITE_URL}/`;

function offerFromEnv(interval: "month" | "year") {
  const raw =
    interval === "month"
      ? import.meta.env.VITE_PRICE_PRO_MONTHLY?.trim()
      : import.meta.env.VITE_PRICE_PRO_YEARLY?.trim();
  if (!raw) return null;

  // Accept display strings like "€9" or "9€" — schema wants a numeric amount.
  const amount = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  if (!amount) return null;
  const currency = /€|eur/i.test(raw) ? "EUR" : /\$|usd/i.test(raw) ? "USD" : "EUR";

  return {
    "@type": "Offer",
    name: `Pro (${interval === "month" ? "monthly" : "yearly"})`,
    price: amount,
    priceCurrency: currency,
    url: `${SITE_URL}/pricing`,
    availability: "https://schema.org/InStock",
    category: "subscription",
  };
}

const PRO_OFFERS = [offerFromEnv("month"), offerFromEnv("year")].filter(Boolean);

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${HOME}#website`,
      name: SITE_NAME,
      url: HOME,
      description:
        "CLI and dashboard to install AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI.",
      publisher: { "@id": `${HOME}#organization` },
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${HOME}#organization`,
      name: SITE_NAME,
      url: HOME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${HOME}#webpage`,
      url: HOME,
      name: SITE_NAME,
      isPartOf: { "@id": `${HOME}#website` },
      about: { "@id": `${HOME}#software` },
      primaryImageOfPage: `${SITE_URL}/og-v1.png`,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${HOME}#software`,
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Developer Tools",
      operatingSystem: "macOS, Linux, Windows",
      url: HOME,
      downloadUrl: "https://www.npmjs.com/package/@skillmanager/cli",
      softwareVersion: "0.1.0",
      description:
        "Install AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI with one command.",
      featureList: [
        "Install agents into Claude Code, Codex, Cursor, and Gemini CLI",
        "Free plan for one connected machine with a generous catalog",
        "Pro plan with unlimited devices and the full catalog",
        "Publish agents and earn from usage — coming soon on Pro",
      ],
      publisher: { "@id": `${HOME}#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "EUR",
          url: `${SITE_URL}/signup`,
          availability: "https://schema.org/InStock",
          category: "free",
        },
        ...PRO_OFFERS,
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${HOME}#faq`,
      mainEntity: SEO_FAQ.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ],
};

// Escape "<" so the JSON can never close the script element early.
const JSON_LD = JSON.stringify(GRAPH).replace(/</g, "\\u003c");

/** schema.org graph for search engines: site, product, offers, and FAQ. */
export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />;
}
