import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge-variants";

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
