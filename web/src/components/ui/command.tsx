import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface CommandProps {
  command: string;
  label?: string;
  className?: string;
  /** Show the shell prompt glyph before the command. */
  prompt?: boolean;
}

/** A single copyable shell command. */
export function Command({ command, label = "Copy command", className, prompt = true }: CommandProps) {
  return (
    <div
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-subtle pl-3.5 pr-1 font-mono text-[13px]",
        className,
      )}
    >
      {prompt ? (
        <span className="select-none text-faint-foreground" aria-hidden>
          $
        </span>
      ) : null}
      <code className="min-w-0 flex-1 truncate text-foreground">{command}</code>
      <CopyButton value={command} label={label} />
    </div>
  );
}
