import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Quiet in-card navigation link, e.g. "Manage devices" or "View all". */
export function TextLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-6 items-center rounded-sm text-13 font-medium text-accent-text underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    />
  );
}
