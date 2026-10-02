import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CONTAINER, Code, INSTALL_COMMAND, LANDING_BODY } from "./layout";

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="border-y border-border bg-subtle">
      <div className={cn(CONTAINER, "flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between")}>
        <div className="max-w-[52ch]">
          <h2
            id="closing-title"
            className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[32px]"
          >
            Install your first agents
          </h2>
          <p className={cn("mt-4 text-muted-foreground", LANDING_BODY)}>
            Create a free account, install the CLI, then run <Code>sm login</Code> and <Code>sm install</Code>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Create free account
          </Link>
          <Command command={INSTALL_COMMAND} label="Copy install command" className="h-11 bg-surface" />
        </div>
      </div>
    </section>
  );
}
