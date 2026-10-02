# SkillManager web design system

Direction: **Moss**. Grey stone neutrals, a muted moss green accent, Hanken Grotesk for text and JetBrains Mono for anything a user types or copies. The product should feel like a well-made tool: calm, precise, and quiet until something needs attention.

All tokens live in `src/index.css`. The default Tailwind palette is removed, so only the semantic names below compile.

## Color

| Token | Use |
|---|---|
| `background` | Page ground (stone in light mode, deep moss black in dark mode) |
| `surface` | Cards, dialogs, inputs |
| `subtle` | Sidebar, card footers, table headers, inset areas |
| `muted` | Hover fills, meter tracks, selected nav item |
| `border` / `border-strong` | Hairlines / secondary button borders |
| `input` | Form control borders (3:1 against the page) |
| `foreground` | Primary text and the primary (ink) button |
| `muted-foreground` | Secondary text, descriptions |
| `faint-foreground` | Meta text and placeholders only, never body copy |
| `accent` + `accent-foreground` | Fill for the one action a screen exists for (for example "Upgrade to Pro") |
| `accent-text` | Links, active indicators, accent text on light surfaces |
| `accent-subtle` / `accent-border` | Plan badge, selected states |
| `success`, `warning`, `danger` (+ `-subtle`) | Real states only: active device, limit reached, revoke |
| `terminal-*` | The terminal panel, which stays dark in both themes |

Rules:
- Everyday buttons are ink (`variant="primary"`) or outlined (`variant="secondary"`). Use `variant="accent"` at most once per screen.
- No gradients, glows, glass panels, colored section backgrounds, gradient text, or colored icon tiles.
- A status dot always sits next to a text label that names a real state.

## Type

Hanken Grotesk, weights 400, 500, and 600 only.

| Role | Classes |
|---|---|
| App page title | `text-[22px] leading-8 font-semibold tracking-tight` (via `PageHeader`) |
| Card title | `text-[15px] font-semibold tracking-tight` (via `CardTitle`) |
| Body / UI | `text-sm` (14px) |
| Table cells, secondary meta | `text-13` (13px / 20px) |
| Labels, badges, table headers | `text-xs font-medium` in sentence case, never all caps |
| Stat values | `text-2xl font-semibold tracking-tight tabular` |
| Landing h1 | `text-[40px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]` |
| Landing h2 | `text-[28px] sm:text-[32px] leading-tight font-semibold tracking-[-0.02em]` |
| Landing body | `text-base sm:text-[17px] leading-7` |

Commands, device codes, file paths, versions, and IDs use `font-mono`. Numbers that line up use the `tabular` utility.

## Shape and depth

- Radius: `rounded-md` (6px) for controls, `rounded-lg` (8px) for cards and code blocks, `rounded-xl` (12px) for dialogs and large panels. Nothing rounder, except avatars and dots (`rounded-full`).
- Structure comes from 1px borders. `shadow-xs` on cards and buttons (light theme only); `shadow-float` only for things that float (dialogs, menus).
- Spacing follows the 4px scale. Page sections are separated by `gap-8` in the app and `py-20 sm:py-28` on the landing page.

## Motion

- Hover and color: 150ms. Dialogs: 200ms. Drawers: 240ms. Easing `var(--ease-out-strong)`.
- Animate only `transform`, `opacity`, and colors; never `transition-all`.
- No scroll-triggered fade-ins, parallax, typing loops, or hover lifts. Nothing above the fold starts invisible.
- `prefers-reduced-motion` is respected globally.

## Components (`src/components`)

- `ui/button`: `Button`; `ui/button-variants`: `buttonVariants` (variants `primary`, `accent`, `secondary`, `ghost`, `danger`, `link`; sizes `sm`, `md`, `lg`, `icon`, `icon-sm`; `loading` prop). Style a `Link` with `buttonVariants(...)`.
- `ui/card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- `ui/badge`: `Badge` (`neutral`, `outline`, `accent`, `success`, `warning`, `danger`) and `StatusDot`.
- `ui/command`: one copyable shell command. `ui/copy-button`: icon button with a live "Copied" announcement.
- `ui/dialog`: modal on the native `<dialog>` element (focus trap, Escape, inert background).
- `ui/alert`, `ui/empty-state`, `ui/skeleton`, `ui/spinner`, `ui/meter`, `ui/segmented-control`, `ui/page-header`.
- `seo`: `Seo` for public pages, `AppSeo` for signed-in pages (always `noindex`). One per page.
- `status-screen`: full-page message for standalone flows.

## Content

- No em dashes or en dashes used as dashes. Use a period, comma, colon, or parentheses.
- Sentence case everywhere. Second person, active voice, specific verbs ("Revoke device", "Create free account").
- Avoid hype words: supercharge, unlock, seamless, robust, effortless, powerful, revolutionize, game-changer.
- Never invent data: no testimonials, logos, user counts, ratings, or prices that are not configured. Terminal examples use the CLI's real output strings and are labeled as examples.
- Errors say what happened and how to fix it. Loading text uses the ellipsis character (…).

## Accessibility

- Every interactive element shows the `:focus-visible` ring. Never remove an outline without a replacement.
- Hit targets are at least 24px, and at least 40px for primary touch actions on mobile.
- One `h1` per page. App pages get it from `PageHeader`, which also receives focus after navigation.
- Icons that carry meaning have a text label or `aria-label`; decorative icons are `aria-hidden`.
- Tables keep real `<th scope="col">` headers. On narrow screens they scroll inside their own container or collapse into stacked rows.
