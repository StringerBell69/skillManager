import { Command } from "@/components/ui/command";
import { InlineCode } from "./inline-code";

/** Full-plan install, plus the flags people ask about most. */
export function InstallRow() {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
      <Command command="sm install" label="Copy install command" className="w-full shrink-0 sm:w-60" />
      <p className="text-13 text-muted-foreground">
        Use <InlineCode>--tools</InlineCode> to choose tools, or <InlineCode>--pack</InlineCode> for a curated pack,
        for example <InlineCode>sm install --pack code-quality</InlineCode>.
      </p>
    </div>
  );
}
