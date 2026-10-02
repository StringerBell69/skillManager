import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CONTAINER, Code, INSTALL_COMMAND, LANDING_BODY } from "./layout";

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="border-t border-border bg-subtle">
      <div className={cn(CONTAINER, "grid gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:items-end")}>
        <div className="lg:col-span-7">
          <h2
            id="closing-title"
            className="text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[44px]"
          >
            Install your first agents today.
          </h2>
          <p className={cn("mt-5 max-w-[52ch] text-muted-foreground", LANDING_BODY)}>
            Create a free account, install the CLI, then run <Code>sm login</Code> and <Code>sm install</Code> in a project.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Create free account
            </Link>
            <Link to="/pricing" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Compare plans
            </Link>
          </div>
          <Command command={INSTALL_COMMAND} label="Copy install command" className="h-11 w-full bg-surface sm:max-w-sm" />
        </div>
      </div>
    </section>
  );
}
