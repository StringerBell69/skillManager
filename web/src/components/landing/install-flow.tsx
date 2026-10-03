import { useRef, useState, type ReactNode } from "react";
import { Bot, Check, Lock, Pause, Play, ScrollText, Wrench, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInView, useLoopClock, usePageVisible, usePrefersReducedMotion } from "./use-animation";

/*
 * An animated replay of `sm install` in a fresh project on the Free plan.
 * Every string the terminal shows is the CLI's real output (clack prompts),
 * and every path is what the adapters in shared/src/adapters write.
 * The still frame (prerender, reduced motion, paused) is the finished state.
 */

type Kind = "Agent" | "Skill" | "Rule";

interface Item {
  slug: string;
  kind: Kind;
  version: string;
}

const ITEMS: Item[] = [
  { slug: "code-reviewer", kind: "Agent", version: "1.0.0" },
  { slug: "typescript-standards", kind: "Rule", version: "1.0.0" },
];

const LOCKED: Item = { slug: "security-auditor", kind: "Agent", version: "1.0.0" };

const KIND_ICON: Record<Kind, LucideIcon> = { Agent: Bot, Skill: Wrench, Rule: ScrollText };

interface Tool {
  name: string;
  /** Option label in the CLI's tool prompt. */
  option: string;
  shared: boolean;
  path: (item: Item) => string;
}

const CLAUDE_DIR: Record<Kind, string> = { Agent: "agents", Skill: "skills", Rule: "rules" };

const TOOLS: Tool[] = [
  {
    name: "Claude Code",
    option: "Claude",
    shared: false,
    path: (item) =>
      item.kind === "Skill" ? `.claude/skills/${item.slug}/SKILL.md` : `.claude/${CLAUDE_DIR[item.kind]}/${item.slug}.md`,
  },
  { name: "Codex", option: "Codex", shared: true, path: () => "AGENTS.md" },
  { name: "Cursor", option: "Cursor", shared: false, path: (item) => `.cursor/rules/${item.slug}.mdc` },
  { name: "Gemini CLI", option: "Gemini", shared: true, path: () => "GEMINI.md" },
];

const COMMAND = "sm install";
const PROMPT = "Which tools do you want to install agents for?";

// Timeline in milliseconds.
const TYPE_START = 300;
const CHAR_MS = 55;
const TYPED_AT = TYPE_START + COMMAND.length * CHAR_MS;
const INTRO_AT = TYPED_AT + 300;
const PROMPT_AT = INTRO_AT + 250;
const SUBMIT_AT = PROMPT_AT + 1300;
const SEND_MS = 450;
const TOOL_STAGGER = 140;
const ITEM_STARTS = [SUBMIT_AT + 450, SUBMIT_AT + 450 + 1250];
const WRITTEN_AT = ITEM_STARTS[ITEM_STARTS.length - 1] + SEND_MS + TOOL_STAGGER * (TOOLS.length - 1);
const SUMMARY_AT = [WRITTEN_AT + 450, WRITTEN_AT + 650, WRITTEN_AT + 900];
const FINISHED_AT = SUMMARY_AT[SUMMARY_AT.length - 1];
const LOOP_MS = FINISHED_AT + 4500;
/** Start the loop on the finished frame so the first thing visitors see is complete. */
const HOLD_START = FINISHED_AT + 300;

const receivedAt = (item: number, tool: number) => ITEM_STARTS[item] + SEND_MS + tool * TOOL_STAGGER;

function sceneAt(t: number) {
  return {
    typed: Math.max(0, Math.min(COMMAND.length, Math.floor((t - TYPE_START) / CHAR_MS))),
    typing: t < TYPED_AT,
    intro: t >= INTRO_AT,
    prompt: t >= PROMPT_AT,
    submitted: t >= SUBMIT_AT,
    sending: ITEMS.findIndex((_, i) => t >= ITEM_STARTS[i] && t < ITEM_STARTS[i] + SEND_MS),
    sent: ITEMS.map((_, i) => t >= ITEM_STARTS[i] + SEND_MS),
    received: TOOLS.map((_, tool) => ITEMS.filter((_, item) => t >= receivedAt(item, tool)).length),
    writing: TOOLS.map((_, tool) => ITEMS.some((_, item) => t >= receivedAt(item, tool) - 260 && t < receivedAt(item, tool))),
    summary: SUMMARY_AT.filter((at) => t >= at).length,
  };
}

type Scene = ReturnType<typeof sceneAt>;

const FINAL_SCENE = sceneAt(FINISHED_AT + 1);

/* Terminal pieces. Colors follow clack: cyan and green map to the terminal accent. */

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-terminal-muted">{children}</span>;
}

function Accent({ children }: { children: ReactNode }) {
  return <span className="text-terminal-accent">{children}</span>;
}

function TerminalLines({ scene }: { scene: Scene }) {
  return (
    <>
      <div>
        <Muted>$ </Muted>
        {COMMAND.slice(0, scene.typed)}
        {scene.typing ? <span className="ml-px inline-block h-[15px] w-[7px] translate-y-[3px] bg-terminal-foreground/80" /> : null}
      </div>
      {scene.intro ? (
        <>
          <div>
            <Muted>┌</Muted>
            {"  "}
            <span className="rounded-sm bg-terminal-accent/15 text-terminal-accent"> SkillManager Install </span>
          </div>
          <div>
            <Muted>│</Muted>
          </div>
        </>
      ) : null}
      {scene.prompt && !scene.submitted ? (
        <>
          <div>
            <Accent>◆</Accent>
            {"  "}
            {PROMPT}
          </div>
          {TOOLS.map((tool) => (
            <div key={tool.option}>
              <Accent>│</Accent>
              {"  "}
              <Accent>◼</Accent> {tool.option}
            </div>
          ))}
          <div>
            <Accent>└</Accent>
          </div>
        </>
      ) : null}
      {scene.submitted ? (
        <>
          <div>
            <Accent>◇</Accent>
            {"  "}
            {PROMPT}
          </div>
          <div>
            <Muted>│</Muted>
            {"  "}
            <Muted>{TOOLS.map((tool) => tool.option).join(", ")}</Muted>
          </div>
          <div>
            <Muted>│</Muted>
          </div>
        </>
      ) : null}
      {scene.summary >= 1 ? (
        <div>
          <Accent>◆</Accent>
          {"  "}
          <span className="font-semibold">Install complete:</span>
        </div>
      ) : null}
      {scene.summary >= 2 ? (
        <div>
          <Muted>│</Muted>
          {"    "}
          <Accent>6 created</Accent>
          {"  "}
          <span className="text-terminal-warning">2 updated</span>
          {"  "}
          <Muted>0 skipped</Muted>
        </div>
      ) : null}
      {scene.summary >= 3 ? (
        <div>
          <Muted>└</Muted>
          {"  "}
          <Accent>✓ Agents installed!</Accent>
        </div>
      ) : null}
    </>
  );
}

/* Connectors between the three columns (large screens only). */

const ROW_CENTERS = [42, 134, 226, 318];
const MID = 180;

function Wire({ d, active }: { d: string; active: boolean }) {
  return (
    <>
      <path d={d} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" />
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
        className={cn("transition-opacity duration-200", active ? "animate-[wire_600ms_linear_infinite] opacity-100" : "opacity-0")}
      />
    </>
  );
}

function InboundWire({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 40 360" className="hidden h-[360px] w-10 lg:block" aria-hidden>
      <Wire d={`M0 ${MID} H40`} active={active} />
    </svg>
  );
}

function FanWires({ active }: { active: boolean[] }) {
  return (
    <svg viewBox="0 0 40 360" className="hidden h-[360px] w-10 lg:block" aria-hidden>
      {ROW_CENTERS.map((y, index) => (
        <Wire key={y} d={`M0 ${MID} C 22 ${MID}, 18 ${y}, 40 ${y}`} active={active[index]} />
      ))}
    </svg>
  );
}

function CatalogColumn({ scene }: { scene: Scene }) {
  return (
    <div className="rounded-xl border border-card-edge bg-subtle p-2">
      <div className="flex items-center justify-between gap-2 px-1.5 pb-2.5 pt-1">
        <span className="text-xs font-medium text-muted-foreground">Your catalog</span>
        <Badge variant="neutral">Free plan</Badge>
      </div>
      <ul className="space-y-1.5">
        {ITEMS.map((item, index) => {
          const Icon = KIND_ICON[item.kind];
          const active = scene.sending === index;
          return (
            <li
              key={item.slug}
              className={cn(
                "flex items-center gap-3 rounded-[14px] border bg-surface px-3 py-2.5 transition-[border-color,background-color] duration-300",
                active ? "border-accent-border bg-accent-subtle" : "border-card-edge",
              )}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[12.5px] text-foreground">{item.slug}</p>
                <p className="text-xs text-muted-foreground">
                  {item.kind} · v{item.version}
                </p>
              </div>
              <Check
                className={cn(
                  "size-4 shrink-0 text-success transition-opacity duration-300",
                  scene.sent[index] ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
            </li>
          );
        })}
        <li className="flex items-center gap-3 rounded-[14px] border border-dashed border-border-strong px-3 py-2.5">
          <Lock className="size-4 shrink-0 text-faint-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[12.5px] text-muted-foreground">{LOCKED.slug}</p>
            <p className="text-xs text-muted-foreground">{LOCKED.kind} · Pro plan</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

function ToolRow({ tool, received, writing }: { tool: Tool; received: number; writing: boolean }) {
  const done = received === ITEMS.length;
  const paths = tool.shared ? (received > 0 ? [tool.path(ITEMS[0])] : []) : ITEMS.slice(0, received).map(tool.path);

  return (
    <li
      className={cn(
        "flex h-[84px] items-start gap-3 rounded-lg border bg-surface px-3.5 py-3 shadow-xs transition-[border-color] duration-300",
        writing ? "border-accent-border" : "border-card-edge",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-foreground">{tool.name}</p>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular">
            {tool.shared
              ? `${received} ${received === 1 ? "section" : "sections"}`
              : `${received} ${received === 1 ? "file" : "files"}`}
            <Check
              className={cn("size-3.5 text-success transition-opacity duration-300", done ? "opacity-100" : "opacity-0")}
              aria-hidden
            />
          </span>
        </div>
        <ul className="mt-1.5 space-y-0.5 font-mono text-xs leading-[18px] text-muted-foreground">
          {paths.length === 0 ? <li className="text-faint-foreground">Waiting…</li> : null}
          {paths.map((path) => (
            <li key={path} className="truncate animate-[fade-in_300ms_var(--ease-out-strong)]">
              {path}
            </li>
          ))}
          {tool.shared && received > 0 ? <li className="truncate text-faint-foreground">Marked sections only</li> : null}
        </ul>
      </div>
    </li>
  );
}

export function InstallFlow({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const inView = useInView(stageRef);
  const [paused, setPaused] = useState(false);

  const animated = !reducedMotion;
  const clock = useLoopClock(LOOP_MS, animated && !paused && inView && pageVisible, HOLD_START);
  const scene = animated ? sceneAt(clock) : FINAL_SCENE;

  return (
    <figure className={cn("rounded-2xl border border-card-edge bg-surface shadow-card", className)}>
      <figcaption className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 sm:px-5">
        <span className="text-13 text-muted-foreground">
          Example: <code className="font-mono text-[12.5px] text-foreground">sm install</code> in a new project on the
          Free plan
        </span>
        {animated ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-13 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> animation</span>
          </button>
        ) : null}
      </figcaption>

      <p className="sr-only">
        Running sm install and keeping all four tools selected installs the two Free items, code-reviewer and
        typescript-standards. Claude Code gets .claude/agents/code-reviewer.md and .claude/rules/typescript-standards.md,
        Cursor gets two .mdc files in .cursor/rules, and Codex and Gemini CLI each get two marked sections in AGENTS.md and
        GEMINI.md. The CLI reports 6 created, 2 updated, 0 skipped. security-auditor needs the Pro plan.
      </p>

      <div
        ref={stageRef}
        aria-hidden
        className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,17rem)_2.5rem_minmax(0,1fr)_2.5rem_minmax(0,1fr)] lg:items-center lg:gap-0"
      >
        <CatalogColumn scene={scene} />
        <InboundWire active={scene.sending >= 0} />

        <div className="flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-terminal-border bg-terminal text-terminal-foreground lg:h-[360px]">
          <div className="flex h-9 shrink-0 items-center border-b border-terminal-border px-3.5 text-xs text-terminal-muted">
            ~/projects/acme-api
          </div>
          <div className="flex-1 overflow-hidden whitespace-pre-wrap break-words px-3.5 py-3 font-mono text-[12px] leading-[21px] sm:text-[12.5px]">
            <TerminalLines scene={scene} />
          </div>
        </div>

        <FanWires active={scene.writing} />

        <ul className="grid gap-2">
          {TOOLS.map((tool, index) => (
            <ToolRow key={tool.name} tool={tool} received={scene.received[index]} writing={scene.writing[index]} />
          ))}
        </ul>
      </div>
    </figure>
  );
}
