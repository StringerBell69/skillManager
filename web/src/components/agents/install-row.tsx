import { Command } from "@/components/ui/command";
import { InlineCode } from "./inline-code";

/** The one command that installs everything on the plan, plus the flag people ask about most. */
export function InstallRow() {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
      <Command command="sm install" label="Copy install command" className="w-full shrink-0 sm:w-60" />
      <p className="text-13 text-muted-foreground">
        Use <InlineCode>--tools</InlineCode> to choose tools, for example{" "}
        <InlineCode>sm install --tools claude,cursor</InlineCode>.
      </p>
    </div>
  );
}
