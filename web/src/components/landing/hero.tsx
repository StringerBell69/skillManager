import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CONTAINER, Code, INSTALL_COMMAND, LANDING_BODY } from "./layout";
import { Terminal } from "./terminal";

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div
        className={cn(
          CONTAINER,
          "grid gap-12 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16",
        )}
      >
        <div className="min-w-0">
          <h1
            id="hero-title"
            className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[52px]"
          >
            Install AI agents into your coding tools with one command.
          </h1>
          <p className={cn("mt-6 max-w-[60ch] text-muted-foreground", LANDING_BODY)}>
            SkillManager distributes agents, skills, and rules. Run <Code>sm install</Code> and each one lands where
            Claude Code, Codex, Cursor, and Gemini CLI look for it, in your project or in your home directory.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Create free account
            </Link>
            <Command command={INSTALL_COMMAND} label="Copy install command" className="h-11 bg-surface" />
          </div>
          <p className="mt-4 text-13 text-muted-foreground">Free plan, no card required.</p>
        </div>

        <Terminal />
      </div>
    </section>
  );
}
