import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";
import { Command } from "@/components/ui/command";
import { CONTAINER, Code, INSTALL_COMMAND } from "./layout";
import { InstallFlow } from "./install-flow";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pb-20 pt-12 sm:pb-28 sm:pt-20 lg:pt-24">
      <div className={CONTAINER}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1
            id="hero-title"
            className="text-[40px] font-semibold leading-[1.03] tracking-[-0.035em] text-foreground sm:text-[56px] lg:col-span-7 lg:text-[64px]"
          >
            SkillManager installs AI agents in Claude Code, Codex, Cursor, and Gemini CLI.
          </h1>

          <div className="lg:col-span-5 lg:pb-1.5">
            <p className="max-w-[52ch] text-base leading-7 text-muted-foreground sm:text-[17px]">
              One catalog of agents, skills, and rules, written where each tool reads it. Sign in once, run{" "}
              <Code>sm install</Code>, and stay current with <Code>sm update</Code>.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Create free account
              </Link>
              <a href="#how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See how it works
              </a>
            </div>
          </div>
        </div>

        <InstallFlow className="mt-12 sm:mt-16" />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Command command={INSTALL_COMMAND} label="Copy install command" className="w-full bg-surface sm:w-auto" />
          <p className="text-13 text-muted-foreground">Free plan for one machine. No card required.</p>
        </div>
      </div>
    </section>
  );
}
