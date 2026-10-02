import { cn } from "@/lib/utils";

interface MeterProps {
  value: number;
  /** `null` means unlimited. */
  max: number | null;
  label: string;
  className?: string;
}

/** Usage bar. Turns amber when the limit is reached. */
export function Meter({ value, max, label, className }: MeterProps) {
  if (max === null) {
    return (
      <div className={cn("h-1.5 w-full rounded-full bg-muted", className)} role="img" aria-label={`${label}: ${value} used, unlimited`}>
        <div className="h-full w-full rounded-full bg-[repeating-linear-gradient(90deg,var(--border-strong)_0_6px,transparent_6px_10px)]" />
      </div>
    );
  }

  const ratio = max === 0 ? 1 : Math.min(value / max, 1);
  const atLimit = value >= max;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={`${value} of ${max}`}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", atLimit ? "bg-warning" : "bg-foreground")}
        style={{ width: `${Math.max(ratio * 100, value > 0 ? 4 : 0)}%` }}
      />
    </div>
  );
}
