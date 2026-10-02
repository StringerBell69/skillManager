import type { ClerkProviderProps } from "@clerk/clerk-react";

type ClerkAppearance = NonNullable<ClerkProviderProps["appearance"]>;

/**
 * Clerk components read the same CSS tokens as the rest of the app, so
 * toggling the `.dark` class re-themes them with no extra JavaScript.
 * Module scope keeps the object stable across renders.
 */
export const clerkAppearance: ClerkAppearance = {
  theme: "simple",
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "var(--foreground)",
    colorPrimaryForeground: "var(--background)",
    colorBackground: "var(--surface)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorMuted: "var(--subtle)",
    colorInput: "var(--surface)",
    colorInputForeground: "var(--foreground)",
    // Clerk derives translucent borders and hover fills from this ink color.
    colorNeutral: "var(--foreground)",
    colorRing: "var(--ring)",
    colorDanger: "var(--danger)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    colorModalBackdrop: "black",
    fontFamily: "inherit",
    fontFamilyButtons: "inherit",
    fontSize: "0.875rem",
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 600 },
    // Inputs get 10px corners; buttons are made capsules below, like the rest of the app.
    borderRadius: "0.625rem",
  },
  layout: {
    logoPlacement: "none",
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
    shimmer: false,
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: {
      width: "100%",
      maxWidth: "25rem",
      border: "1px solid var(--card-edge)",
      borderRadius: "1.375rem",
      boxShadow: "var(--elevation-card)",
    },
    headerTitle: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.015em" },
    button: { '&[data-variant="solid"]::after': { display: "none" } },
    formButtonPrimary: { boxShadow: "none", borderRadius: "9999px" },
    socialButtonsBlockButton: { borderRadius: "9999px" },
    providerIcon__github: { ".dark &": { filter: "invert(1)" } },
    providerIcon__apple: { ".dark &": { filter: "invert(1)" } },
    footerActionLink: { color: "var(--accent-text)", fontWeight: 500 },
    userButtonTrigger: { "&:focus-visible": { boxShadow: "0 0 0 2px var(--ring)" } },
    userButtonPopoverCard: { border: "1px solid var(--card-edge)", borderRadius: "1rem", boxShadow: "var(--elevation-float)" },
  },
};
