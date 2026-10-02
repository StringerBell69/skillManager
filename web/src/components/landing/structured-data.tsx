import { SITE_NAME, SITE_URL } from "@/lib/site";

const HOME = `${SITE_URL}/`;

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${HOME}#website`,
      name: SITE_NAME,
      url: HOME,
      publisher: { "@id": `${HOME}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${HOME}#organization`,
      name: SITE_NAME,
      url: HOME,
      logo: `${SITE_URL}/icon-512.png`,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${HOME}#software`,
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      url: HOME,
      publisher: { "@id": `${HOME}#organization` },
    },
  ],
};

// Escape "<" so the JSON can never close the script element early.
const JSON_LD = JSON.stringify(GRAPH).replace(/</g, "\\u003c");

/** schema.org description of the site, the company, and the CLI for search engines. */
export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />;
}
