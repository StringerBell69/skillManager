import type { ReactNode } from "react";
import { Bot, Laptop, ScrollText, Wrench } from "lucide-react";
import { StatusDot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Code, Section, SectionHeading } from "./layout";
import { MiniTerminal } from "./scenes";

/* Product artifacts in mixed formats: a prompt, a dry run, a device list, the catalog model. */

function Tile({ title, children, visual, className }: { title: string; children: ReactNode; visual?: ReactNode; className?: string }) {
  return (
    <article className={cn("flex flex-col rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-6", className)}>
      <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-[56ch] text-sm leading-6 text-muted-foreground">{children}</p>
      {visual ? <div className="mt-6 flex-1">{visual}</div> : null}
    </article>
  );
}

function T({ tone, children }: { tone: "muted" | "accent"; children: ReactNode }) {
  return <span className={tone === "muted" ? "text-terminal-muted" : "text-terminal-accent"}>{children}</span>;
}

function OverwritePrompt() {
  return (
    <MiniTerminal title="~/projects/acme-api">
      <div>
        <T tone="muted">$ </T>sm install
      </div>
      <div>
        <T tone="muted">┌</T>
        {"  "}
        <span className="rounded-sm bg-terminal-accent/15 text-terminal-accent"> SkillManager Install </span>
      </div>
      <div>
        <T tone="muted">│</T>
      </div>
      <div>
        <T tone="accent">◆</T>
        {"  .claude/agents/code-reviewer.md has been locally modified. Overwrite?"}
      </div>
      <div>
        <T tone="accent">│</T>
        {"  "}
        <T tone="accent">●</T> Yes <T tone="muted">/ ○ No</T>
      </div>
      <div>
        <T tone="accent">└</T>
      </div>
    </MiniTerminal>
  );
}

function DryRun() {
  return (
    <MiniTerminal title="~/projects/acme-api">
      <div>
        <T tone="muted">$ </T>sm install --dry-run --tools claude
      </div>
      <div>
        <T tone="accent">●</T>
        {"  "}
        <span className="font-semibold">Dry run (no files will be written):</span>
      </div>
      <div>
        {"  "}
        <T tone="accent">create</T> .claude/agents/code-reviewer.md
      </div>
      <div>
        {"  "}
        <T tone="accent">create</T> .claude/rules/typescript-standards.md
      </div>
      <div>
        <T tone="accent">●</T>
        {"  2 agent(s) would be installed."}
      </div>
    </MiniTerminal>
  );
}

const DEVICES = [
  { name: "ada-macbook-pro", active: true, lastUsed: "3 minutes ago" },
  { name: "build-server-01", active: false, lastUsed: "2 days ago" },
  { name: "ada-thinkpad", active: false, lastUsed: "Not used yet" },
];

function DeviceList() {
  return (
    <div aria-hidden className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border bg-subtle px-3.5 py-2 text-xs font-medium text-muted-foreground">
        <span>Device</span>
        <span>Last used</span>
      </div>
      <ul className="divide-y divide-border">
        {DEVICES.map((device) => (
          <li key={device.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2.5 text-13">
            <span className="flex min-w-0 items-center gap-2">
              <Laptop className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate font-medium text-foreground">{device.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <StatusDot tone={device.active ? "success" : "neutral"} />
                {device.active ? "Active" : "Idle"}
              </span>
            </span>
            <span className="flex items-center gap-3 text-muted-foreground">
              <span className="hidden sm:inline">{device.lastUsed}</span>
              <span className="px-1.5 text-xs font-medium text-foreground">Revoke</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const KINDS = [
  { icon: Bot, kind: "Agent", example: "code-reviewer", body: "A focused assistant your tool can hand work to." },
  { icon: Wrench, kind: "Skill", example: "api-designer", body: "A procedure the assistant follows when a task calls for it." },
  { icon: ScrollText, kind: "Rule", example: "typescript-standards", body: "Standards applied to the code it writes." },
];

function Kinds() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
      {KINDS.map(({ icon: Icon, kind, example, body }) => (
        <li key={kind} className="flex flex-col bg-surface p-4">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon className="size-4 text-muted-foreground" aria-hidden />
            {kind}
          </span>
          <span className="mt-2 flex-1 text-13 leading-5 text-muted-foreground">{body}</span>
          <code className="mt-4 truncate font-mono text-xs text-accent-text">{example}</code>
        </li>
      ))}
    </ul>
  );
}

const FLAGS = [
  { flag: "--global", body: "Installs into your home directory instead of the current project." },
  { flag: "--yes", body: "Skips the prompts. Without a terminal attached, the CLI prints one plain line." },
  { flag: "sm remove <slug>", body: "Deletes an item's files and takes its section out of shared files." },
];

export function Features() {
  return (
    <Section id="features" labelledBy="features-title" className="bg-subtle">
      <SectionHeading id="features-title" title="Predictable on every machine">
        The CLI only touches the files it manages, and every change can be previewed first.
      </SectionHeading>

      <div className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-12">
        <Tile title="Your edits stay yours" className="lg:col-span-7" visual={<OverwritePrompt />}>
          <Code>sm install</Code> records a content hash for every file it writes. If you changed one, it asks before
          replacing it. In scripts the file is skipped unless you pass <Code>--force</Code>.
        </Tile>
        <Tile title="Preview before writing" className="lg:col-span-5" visual={<DryRun />}>
          <Code>--dry-run</Code> lists every file that would be created or updated, and writes nothing.
        </Tile>
        <Tile title="Every machine in one list" className="lg:col-span-5" visual={<DeviceList />}>
          The dashboard shows where the CLI is signed in and when each machine last used it. Revoke one and it is signed
          out right away.
        </Tile>
        <Tile title="Agents, skills, and rules" className="lg:col-span-7" visual={<Kinds />}>
          The catalog holds three kinds of items. <Code>sm install</Code> writes each kind where the tool expects it.
        </Tile>

        <div className="rounded-xl border border-border bg-surface shadow-xs lg:col-span-12">
          <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {FLAGS.map(({ flag, body }) => (
              <div key={flag} className="p-5 sm:p-6">
                <dt>
                  <code className="font-mono text-[13px] font-medium text-foreground">{flag}</code>
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
