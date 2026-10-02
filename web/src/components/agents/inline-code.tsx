import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A command or flag inside running text, e.g. `sm install`. */
export function InlineCode({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={cn("rounded-sm bg-muted px-1 py-px font-mono text-xs text-foreground wrap-anywhere", className)}
      {...props}
    />
  );
}
