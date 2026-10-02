import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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

interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Small status dot used before a label, e.g. "Active". */
export function StatusDot({ tone = "neutral", pulse = false }: { tone?: "neutral" | "success" | "warning" | "danger"; pulse?: boolean }) {
  const color = {
    neutral: "bg-faint-foreground",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];
  return (
    <span className="relative inline-flex size-1.5 shrink-0" aria-hidden>
      {pulse ? <span className={cn("absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping", color)} /> : null}
      <span className={cn("relative inline-flex size-1.5 rounded-full", color)} />
    </span>
  );
}
