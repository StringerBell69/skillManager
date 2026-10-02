import { cn } from "@/lib/utils";

/** SkillManager mark: stacked layers, one per installed skill. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6 shrink-0", className)} aria-hidden focusable="false">
      <rect width="24" height="24" rx="6" fill="var(--mark)" />
      <path d="M12 5.25 18.75 8.6 12 11.95 5.25 8.6 12 5.25Z" fill="var(--mark-foreground)" />
      <path d="m5.25 12.05 6.75 3.35 6.75-3.35" stroke="var(--mark-foreground)" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="m5.25 15.4 6.75 3.35 6.75-3.35" stroke="var(--mark-foreground)" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">SkillManager</span>
    </span>
  );
}
