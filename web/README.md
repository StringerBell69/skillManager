# @skillmanager/web

Landing page and signed-in dashboard for SkillManager. Vite, React 19, React Router 7, Tailwind CSS 4, Clerk, and TanStack Query.

## Routes

| Path | Rendering | Purpose |
|---|---|---|
| `/`, `/pricing` | Prerendered at build time, hydrated | Public landing and pricing pages |
| `/login/*`, `/signup/*` | Client | Clerk sign-in and sign-up |
| `/cli?code=ABCD-2345` | Client | Approve or deny a `sm login` request |
| `/dashboard`, `/agents`, `/devices`, `/billing`, `/settings` | Client, `noindex` | Signed-in app (press ⌘K or Ctrl K for the command menu) |

Clerk and React Query load only on the routes that need them, so the landing page ships without them.

## Setup

```bash
cp .env.example .env
bun run dev        # http://localhost:3000
```

| Variable | Required | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `VITE_API_URL` | Yes | SkillManager API origin |
| `VITE_SITE_URL` | For builds | Public origin used for canonical URLs, Open Graph tags, and the sitemap |
| `VITE_PRICE_PRO_MONTHLY`, `VITE_PRICE_PRO_YEARLY` | No | Display prices on the landing and billing pages, e.g. `€9`. Without them the pages say the price is shown at checkout. |

## Build

```bash
bun run build      # tsc, client build, SSR build of the landing page, prerender
bun run lint
```

`scripts/prerender.mjs` writes into `dist/`:

- `index.html` and `pricing/index.html`: the public pages with their head tags and markup already rendered
- `app.html`: the shell for signed-in routes (`noindex`)
- `404.html`: the same shell for unknown paths, to be served with a 404 status
- `robots.txt` and `sitemap.xml`

The host must serve `app.html` for the signed-in routes and must not fall back to `index.html` for them. `public/_redirects` covers Netlify and Cloudflare Pages.

## Design

The design system (tokens, type scale, components, content rules) is documented in [DESIGN.md](./DESIGN.md). Fonts are self-hosted from `src/assets/fonts` under the SIL Open Font License.
