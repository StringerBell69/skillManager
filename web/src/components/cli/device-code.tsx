import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { spellUserCode } from "./user-code";

interface DeviceCodeProps {
  code: string;
  /** Optional strip under the code, e.g. the signed-in account. */
  footer?: ReactNode;
  className?: string;
}

/** The code the user compares with their terminal. Expects a validated code. */
export function DeviceCode({ code, footer, className }: DeviceCodeProps) {
  const [letters = "", digits = ""] = code.split("-");

  return (
    <div className={cn("rounded-lg border border-border bg-surface shadow-xs", className)}>
      <div className="px-5 pb-4 pt-3.5">
        <p className="text-xs font-medium text-muted-foreground">Device code</p>
        <p className="mt-1 font-mono text-[30px] font-medium leading-10 tracking-[0.12em] text-foreground tabular">
          <span aria-hidden>
            {letters}
            <span className="text-faint-foreground">-</span>
            {digits}
          </span>
          <span className="sr-only">{spellUserCode(code)}</span>
        </p>
      </div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-b-lg border-t border-border bg-subtle px-5 py-2">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
