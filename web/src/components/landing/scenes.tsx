import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/*
 * Small product scenes for the "How it works" steps. Terminal text is the CLI's
 * real output (commander help, clack prompts). `elapsed` is the time since the
 * step became active; Infinity renders the finished still frame.
 */

export interface SceneProps {
  elapsed: number;
}

const USER_CODE = "KPTW-4827";
const VERIFY_URL = `${SITE_URL || "https://skillmanager.dev"}/cli?code=${USER_CODE}`;
const VERIFY_HOST = VERIFY_URL.replace(/^https?:\/\//, "");

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-terminal-muted">{children}</span>;
}

function Accent({ children }: { children: ReactNode }) {
  return <span className="text-terminal-accent">{children}</span>;
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <div>
      <Muted>$ </Muted>
      {children}
    </div>
  );
}

function Intro({ title }: { title: string }) {
  return (
    <div>
      <Muted>┌</Muted>
      {"  "}
      <span className="rounded-sm bg-terminal-accent/15 text-terminal-accent">{` ${title} `}</span>
    </div>
  );
}

function Rail({ children }: { children?: ReactNode }) {
  return (
    <div>
      <Muted>│</Muted>
      {children}
    </div>
  );
}

export function MiniTerminal({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-terminal-border bg-terminal text-terminal-foreground",
        className,
      )}
    >
      <div className="flex h-9 shrink-0 items-center border-b border-terminal-border px-3.5 text-xs text-terminal-muted">
        {title}
      </div>
      <div className="flex-1 whitespace-pre-wrap break-words px-3.5 py-3 font-mono text-[12px] leading-[21px] sm:text-[12.5px]">
        {children}
      </div>
    </div>
  );
}

/* Step 1: install the CLI. */

const HELP_COMMANDS: Array<[string, string]> = [
  ["login", "Log in to SkillManager via browser (device flow)"],
  ["logout", "Log out and remove saved credentials"],
  ["whoami", "Show current user info (email, plan, status)"],
  ["install [options]", "Install agents into your project"],
  ["update [options]", "Update installed agents to latest versions"],
  ["list [options]", "List installed and available agents"],
  ["remove [options] <slug>", "Remove an installed agent"],
  ["help [command]", "display help for command"],
];

export function InstallCliScene() {
  return (
    <MiniTerminal title="~" className="min-h-[420px]">
      <Prompt>npm i -g @skillmanager/cli</Prompt>
      <Prompt>sm --help</Prompt>
      <div>Usage: skillmanager [options] [command]</div>
      <div> </div>
      <div>SkillManager CLI: install AI agents into your coding tools</div>
      <div> </div>
      <div>Commands:</div>
      {HELP_COMMANDS.map(([command, description]) => (
        <div key={command} className="grid grid-cols-[minmax(0,12rem)_minmax(0,1fr)] gap-x-2 pl-[2ch] max-sm:grid-cols-1">
          <span>{command}</span>
          <Muted>{description}</Muted>
        </div>
      ))}
    </MiniTerminal>
  );
}

/* Step 2: device flow, terminal and browser side by side. */

const APPROVE_AT = 2300;
const APPROVED_AT = 2700;
const LOGGED_IN_AT = 3400;
const SPINNER = ["◒", "◐", "◓", "◑"];

export function SignInScene({ elapsed }: SceneProps) {
  const pressing = elapsed >= APPROVE_AT && elapsed < APPROVED_AT;
  const approved = elapsed >= APPROVED_AT;
  const loggedIn = elapsed >= LOGGED_IN_AT;
  const frame = SPINNER[Math.floor((Number.isFinite(elapsed) ? elapsed : 0) / 160) % SPINNER.length];

  return (
    <div className="grid min-h-[420px] gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <MiniTerminal title="~/projects/acme-api">
        <Prompt>sm login</Prompt>
        <Intro title="SkillManager Login" />
        <Rail />
        <div>
          <Accent>●</Accent>
          {"  Open the browser and enter this code:"}
        </div>
        <Rail />
        <Rail>
          {"    "}
          <span className="font-semibold text-terminal-accent underline underline-offset-4">{USER_CODE}</span>
        </Rail>
        <Rail />
        <Rail>
          {"  Or visit: "}
          <Muted>{VERIFY_URL}</Muted>
        </Rail>
        <Rail />
        <div>
          <Accent>●</Accent>
          {"  Browser opened automatically."}
        </div>
        <Rail />
        {loggedIn ? (
          <>
            <div>
              <Accent>◇</Accent>
              {"  Logged in successfully!"}
            </div>
            <Rail />
            <div>
              <Muted>└</Muted>
              {"  "}
              <Accent>✓ You are now logged in.</Accent>
            </div>
          </>
        ) : (
          <div>
            <Accent>{frame}</Accent>
            {"  Waiting for approval..."}
          </div>
        )}
      </MiniTerminal>

      <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex h-9 shrink-0 items-center border-b border-border bg-subtle px-3">
          <span className="min-w-0 flex-1 truncate rounded-full bg-surface px-3 py-0.5 text-center text-xs text-muted-foreground">
            {VERIFY_HOST}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 py-6">
          {approved ? (
            <div className="animate-[fade-in_300ms_var(--ease-out-strong)]">
              <span className="flex size-8 items-center justify-center rounded-full bg-success-subtle text-success">
                <Check className="size-4" aria-hidden />
              </span>
              <p className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">Device authorized</p>
              <p className="mt-1 text-13 text-muted-foreground">Return to your terminal. The CLI finishes signing in by itself.</p>
            </div>
          ) : (
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">Authorize the SkillManager CLI</p>
              <p className="mt-1 text-13 text-muted-foreground">Check that this code matches the one in your terminal.</p>
              <div className="mt-4 rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-lg font-semibold tracking-[0.12em] text-foreground">
                {USER_CODE}
              </div>
              <div className="mt-4 flex gap-2">
                <span
                  className={cn(
                    "inline-flex h-8 items-center rounded-full bg-accent px-3.5 text-13 font-medium text-accent-foreground transition-[background-color,scale] duration-150",
                    pressing && "scale-[0.97] bg-accent-hover",
                  )}
                >
                  Authorize device
                </span>
                <span className="inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-13 font-medium text-foreground">
                  Deny
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Step 3: the project after `sm install`. */

interface TreeLine {
  path: string;
  depth: number;
  last: boolean;
  added?: boolean;
  note?: string;
}

const TREE: TreeLine[] = [
  { path: ".claude/", depth: 0, last: false },
  { path: "agents/code-reviewer.md", depth: 1, last: false, added: true },
  { path: "rules/typescript-standards.md", depth: 1, last: true, added: true },
  { path: ".cursor/rules/", depth: 0, last: false },
  { path: "code-reviewer.mdc", depth: 1, last: false, added: true },
  { path: "typescript-standards.mdc", depth: 1, last: true, added: true },
  { path: ".skillmanager/manifest.json", depth: 0, last: false, added: true, note: "versions and content hashes" },
  { path: "AGENTS.md", depth: 0, last: false, added: true, note: "2 marked sections" },
  { path: "GEMINI.md", depth: 0, last: false, added: true, note: "2 marked sections" },
  { path: "package.json", depth: 0, last: false },
  { path: "src/", depth: 0, last: true },
];

export function ProjectTreeScene() {
  return (
    <div className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-xl border border-card-edge bg-surface shadow-card">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-subtle px-3.5 text-xs text-muted-foreground">
        <span>acme-api</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Written by sm install
        </span>
      </div>
      <ul className="flex-1 px-3.5 py-3 font-mono text-[12px] leading-[26px] sm:text-[12.5px]">
        {TREE.map((line, index) => {
          const parentLast = line.depth > 0 && TREE.slice(0, index).reverse().find((l) => l.depth === 0)?.last;
          return (
            <li key={line.path + index} className="flex min-w-0 items-center gap-3">
              <span className="min-w-0 flex-1 truncate">
                <span className="select-none text-faint-foreground">
                  {line.depth > 0 ? (parentLast ? "   " : "│  ") : ""}
                  {line.last ? "└─ " : "├─ "}
                </span>
                <span className={line.added ? "text-accent-text" : "text-muted-foreground"}>{line.path}</span>
              </span>
              {line.note ? <span className="hidden shrink-0 font-sans text-xs text-muted-foreground sm:inline">{line.note}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Step 4: list and update. */

export function UpdateScene() {
  return (
    <MiniTerminal title="~/projects/acme-api" className="min-h-[420px]">
      <Prompt>sm list</Prompt>
      <Intro title="SkillManager Agents" />
      <Rail />
      <div>
        <Accent>●</Accent>
        {"  "}
        <span className="font-semibold">Installed:</span>
      </div>
      <div>
        {"  "}
        <Accent>●</Accent> <span className="font-semibold">code-reviewer</span> <Muted>v1.0.0</Muted>
      </div>
      <div>
        {"  "}
        <Accent>●</Accent> <span className="font-semibold">typescript-standards</span> <Muted>v1.0.0</Muted>
      </div>
      <div> </div>
      <Prompt>sm update</Prompt>
      <Intro title="SkillManager Update" />
      <Rail />
      <div>
        <Accent>◆</Accent>
        {"  "}
        <span className="font-semibold">Update complete:</span>
      </div>
      <Rail>
        {"    "}
        <Accent>0 added</Accent>
        {"  "}
        <span className="text-terminal-warning">1 updated</span>
        {"  "}
        <Muted>1 unchanged</Muted>
      </Rail>
      <Rail />
      <div>
        <Muted>└</Muted>
        {"  "}
        <Accent>✓ Agents up to date!</Accent>
      </div>
    </MiniTerminal>
  );
}
