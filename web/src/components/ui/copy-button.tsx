import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers or contexts without the async clipboard API.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

interface CopyButtonProps {
  value: string;
  /** Accessible name, e.g. "Copy install command". */
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy to clipboard", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    if (!(await writeClipboard(value))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      title={copied ? "Copied" : label}
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground",
        "transition-colors duration-150 hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Copy className={cn("size-3.5 transition-[opacity,scale] duration-150", copied && "scale-50 opacity-0")} aria-hidden />
      <Check
        className={cn(
          "absolute size-3.5 text-success transition-[opacity,scale] duration-150",
          copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
        aria-hidden
      />
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
