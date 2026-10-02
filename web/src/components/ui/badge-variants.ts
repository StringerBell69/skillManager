import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium leading-4 [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        outline: "border-border-strong bg-transparent text-foreground",
        accent: "border-accent-border bg-accent-subtle text-accent-text",
        success: "border-transparent bg-success-subtle text-success",
        warning: "border-transparent bg-warning-subtle text-warning",
        danger: "border-transparent bg-danger-subtle text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);
