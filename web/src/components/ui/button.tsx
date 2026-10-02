import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

interface ButtonProps extends ComponentProps<"button">, ButtonVariantProps {
  loading?: boolean;
}

export function Button({ className, variant, size, loading = false, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
}
