import { SITE_NAME, SITE_URL } from "@/lib/site";

interface SeoProps {
  /** Full document title. Pages pass e.g. "Devices | SkillManager". */
  title: string;
  description?: string;
  /** Path for the canonical URL, e.g. "/". Only for indexable pages. */
  path?: string;
  noindex?: boolean;
}

/**
 * Per-route head tags using React 19's native hoisting. Mount exactly one per
 * page. Public pages are prerendered, so these tags ship in the HTML that
 * crawlers and link unfurlers read.
 */
export function Seo({ title, description, path, noindex = false }: SeoProps) {
  const canonical =
    path !== undefined && SITE_URL
      ? path === "/"
        ? `${SITE_URL}/`
        : `${SITE_URL}${path}`
      : undefined;

  return (
    <>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large" />
          {canonical ? <link rel="canonical" href={canonical} /> : null}
          <meta property="og:title" content={title} />
          {description ? <meta property="og:description" content={description} /> : null}
          {canonical ? <meta property="og:url" content={canonical} /> : null}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          {description ? <meta name="twitter:description" content={description} /> : null}
        </>
      )}
    </>
  );
}

/** Title helper for app pages, which are never indexed. */
export function AppSeo({ title }: { title: string }) {
  return <Seo title={`${title} | ${SITE_NAME}`} noindex />;
}
