import { useId } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Accessible label when `label` is an icon. */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<Option<T>>;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/** Radio group styled as a segmented control. Arrow keys move between options natively. */
export function SegmentedControl<T extends string>({ value, onChange, options, label, size = "md", className }: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-lg border border-border bg-muted p-0.5", className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium transition-[background-color,color,box-shadow] duration-150",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring",
              size === "sm" ? "h-7 min-w-7 px-2 text-xs" : "h-8 px-3 text-[13px]",
              checked ? "bg-surface text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              aria-label={option.ariaLabel}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
