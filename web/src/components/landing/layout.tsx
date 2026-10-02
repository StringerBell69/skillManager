import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Horizontal frame shared by every landing band, so edges line up from header to footer. */
export const CONTAINER = "mx-auto w-full max-w-[1120px] px-4 sm:px-6";

export const LANDING_BODY = "text-base leading-7 sm:text-[17px]";

export const INSTALL_COMMAND = "npm i -g @skillmanager/cli";

interface SectionProps extends ComponentProps<"section"> {
  /** id of the h2 that names this section. */
  labelledBy: string;
}

/** A full-width band separated from the previous one by a hairline. */
export function Section({ labelledBy, className, children, ...props }: SectionProps) {
  return (
    <section aria-labelledby={labelledBy} className={cn("border-t border-border py-20 sm:py-28", className)} {...props}>
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SectionHeading({ id, title, children, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[60ch]", className)}>
      <h2 id={id} className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[32px]">
        {title}
      </h2>
      {children ? <p className={cn("mt-4 text-muted-foreground", LANDING_BODY)}>{children}</p> : null}
    </div>
  );
}

/** A command, flag, or path inside running text. */
export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cn("font-mono text-[0.875em] text-foreground", className)}>{children}</code>;
}

/**
 * A file path where `<name>` is the per-item placeholder. The placeholder is
 * dimmed so the fixed part of the path reads first.
 */
export function PathLabel({ path, className }: { path: string; className?: string }) {
  const parts = path.split("<name>");
  return (
    <code className={cn("whitespace-nowrap font-mono text-13 text-foreground", className)}>
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 ? <span className="text-muted-foreground">{"<name>"}</span> : null}
          {part}
        </span>
      ))}
    </code>
  );
}
