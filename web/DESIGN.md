# SkillManager web design system

Direction: **Moss**. Grey stone neutrals, a muted moss green accent, Hanken Grotesk for text and JetBrains Mono for anything a user types or copies. The product should feel like a well-made tool: calm, precise, and quiet until something needs attention.

Shapes, lists, bars, and sheets follow Apple's platform conventions, using the principles of the [apple-ui-designer](https://github.com/heyman333/atelier-ui) skill: native patterns over custom ones, hierarchy from size and weight, spacing and grouping instead of heavy borders, and motion that only fades, slides, or scales slightly.

All tokens live in `src/index.css`. The default Tailwind palette is removed, so only the semantic names below compile.

## Color

| Token | Use |
|---|---|
| `background` | Page ground (stone in light mode, deep moss black in dark mode) |
| `surface` | Cards, dialogs, inputs |
| `subtle` | Sidebar, card footers, table headers, inset areas |
| `muted` | Filled secondary buttons, search field, segmented control track, chips, hover fills, selected nav item |
| `card-edge` | Edges of cards, lists, and dialogs: a hairline that is barely there (6% ink, 7% white in dark mode) |
| `border` / `border-strong` | Separators and table lines / dashed placeholders and the sheet grabber |
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
- Everyday buttons are ink (`variant="primary"`) or filled gray (`variant="secondary"`). Use `variant="accent"` at most once per screen.
- Translucency is only for bars that content scrolls under: the site header and the phone top bar and tab bar (`bg-background/80 backdrop-blur-xl backdrop-saturate-180`).
- No gradients, glows, glass cards, colored section backgrounds, gradient text, or colored icon tiles.
- A status dot always sits next to a text label that names a real state.

## Type

Hanken Grotesk, weights 400, 500, and 600 only.

| Role | Classes |
|---|---|
| App page title (large title) | `text-[28px] leading-9 font-semibold tracking-[-0.022em]` (via `PageHeader`) |
| Card title | `text-base font-semibold tracking-tight` (via `CardTitle`) |
| Group label above a section | `text-13 font-medium text-muted-foreground`, as in the Settings page |
| Tab bar label | `text-[11px] font-medium` |
| Body / UI | `text-sm` (14px) |
| Table cells, secondary meta | `text-13` (13px / 20px) |
| Labels, badges, table headers | `text-xs font-medium` in sentence case, never all caps |
| Stat values | `text-2xl font-semibold tracking-tight tabular` |
| Landing h1 | `text-[40px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]` |
| Landing h2 | `text-[28px] sm:text-[32px] leading-tight font-semibold tracking-[-0.02em]` |
| Landing body | `text-base sm:text-[17px] leading-7` |

Commands, device codes, file paths, versions, and IDs use `font-mono`. Numbers that line up use the `tabular` utility.

## Shape and depth

- Radius scale: `rounded-sm` 6px (inline code), `rounded-md` 10px (nav items, menu rows, small tiles), `rounded-lg` 16px (alerts, code windows, inner blocks), `rounded-xl` 22px (cards, lists, tables), `rounded-2xl` 28px (dialogs, the command menu, landing panels, plan cards).
- Every button, segmented control, chip, search field, and step number is a capsule (`rounded-full`). Buttons scale to 0.97 while pressed.
- Nested corners are concentric: inner radius = outer radius minus the padding between them. The install demo's catalog rows are 14px inside a 22px column with 8px of padding.
- Cards read through contrast and a soft shadow, not outlines: `border-card-edge` plus `shadow-card` (two soft layers in light mode, none in dark mode, where lighter surfaces carry depth). `shadow-float` only for things that float (dialogs, menus, popovers).
- Lists use iOS-style inset separators: the `list-inset` utility, with `--list-inset` set to where the text starts. Separators or spacing, never both. Tables keep full-width row lines.
- Spacing follows the 4px scale. Page sections are separated by `gap-8` in the app and `py-20 sm:py-28` on the landing page.

## Phone layout

- Below `lg`, the app has a top bar (logo, search, account) and a bottom tab bar with the five sections. Both are translucent and padded for the safe areas (`viewport-fit=cover`), and the page keeps bottom padding so its end clears the tab bar.
- Below `sm`, dialogs are bottom sheets: 28px top corners, a grabber, full-width 44px buttons above the home indicator, and drag down to dismiss (a long pull or a quick flick; anything shorter springs back).

## Motion

- Hover and color: 150ms. Dialogs: 200ms. Easing `var(--ease-out-strong)`.
- Sheets slide up in 480ms on `var(--ease-sheet)`, the iOS sheet curve: a fast start and a long, soft landing.
- Animate only `transform`, `opacity`, and colors; never `transition-all`.
- No scroll-triggered fade-ins, parallax, or hover lifts. Nothing above the fold starts invisible.
- One orchestrated moment: the home page's install workflow (`components/landing/install-flow.tsx`) and the autoplaying "How it works" steps. Both replay real CLI output only, show their finished frame in prerendered HTML and with reduced motion, pause off screen and in background tabs, and have a visible Pause control.
- `prefers-reduced-motion` is respected globally.

## Components (`src/components`)

- `ui/button`: `Button`; `ui/button-variants`: `buttonVariants` (variants `primary`, `accent`, `secondary`, `ghost`, `danger`, `link`; sizes `sm`, `md`, `lg`, `icon`, `icon-sm`; `loading` prop). Style a `Link` with `buttonVariants(...)`.
- `ui/card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- `ui/badge`: `Badge` (`neutral`, `outline`, `accent`, `success`, `warning`, `danger`) and `StatusDot`.
- `ui/command`: one copyable shell command. `ui/copy-button`: icon button with a live "Copied" announcement.
- `ui/dialog`: modal on the native `<dialog>` element (focus trap, Escape, inert background). A bottom sheet on phones.
- `ui/alert`, `ui/empty-state`, `ui/skeleton`, `ui/spinner`, `ui/meter`, `ui/segmented-control`, `ui/page-header`.
- `seo`: `Seo` for public pages, `AppSeo` for signed-in pages (always `noindex`). One per page.
- `status-screen`: full-page message for standalone flows.
- `command-menu`: the ⌘K / Ctrl K menu in the app shell (pages, agents, copyable commands, theme, account).
- `theme-toggle`: `ThemeToggle`, icon-only in the sidebar and footer, `withLabels` on the Settings page.

## Content

- No em dashes or en dashes used as dashes. Use a period, comma, colon, or parentheses.
- Sentence case everywhere. Second person, active voice, specific verbs ("Revoke device", "Create free account").
- Avoid hype words: supercharge, unlock, seamless, robust, effortless, powerful, revolutionize, game-changer.
- Never invent data: no testimonials, logos, user counts, ratings, or prices that are not configured. Terminal examples use the CLI's real output strings and are labeled as examples.
- Errors say what happened and how to fix it. Loading text uses the ellipsis character (…).

## Accessibility

- Every interactive element shows the `:focus-visible` ring. Never remove an outline without a replacement.
- Hit targets are at least 24px, and at least 40px for primary touch actions on mobile. Tab bar items fill the bar's full 56px height; sheet buttons are 44px.
- One `h1` per page. App pages get it from `PageHeader`, which also receives focus after navigation.
- Icons that carry meaning have a text label or `aria-label`; decorative icons are `aria-hidden`.
- Tables keep real `<th scope="col">` headers. On narrow screens they scroll inside their own container or collapse into stacked rows.
