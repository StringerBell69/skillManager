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
 * page. The landing page is prerendered, so its tags ship in the HTML that
 * crawlers and link unfurlers read.
 */
export function Seo({ title, description, path, noindex = false }: SeoProps) {
  const url = path !== undefined && SITE_URL ? `${SITE_URL}${path}` : undefined;

  return (
    <>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          {url ? <link rel="canonical" href={url} /> : null}
          <meta property="og:title" content={title} />
          {description ? <meta property="og:description" content={description} /> : null}
          {url ? <meta property="og:url" content={url} /> : null}
        </>
      )}
    </>
  );
}

/** Title helper for app pages, which are never indexed. */
export function AppSeo({ title }: { title: string }) {
  return <Seo title={`${title} | ${SITE_NAME}`} noindex />;
}
