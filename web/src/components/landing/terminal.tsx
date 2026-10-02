import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/*
 * A static transcript of a real session. The strings match the CLI's output
 * (clack prompts), with colors mapped onto the terminal tokens: cyan and green
 * become the terminal accent, dim and gray become the muted tone.
 */

const USER_CODE = "KPTW-4827";
const VERIFY_URL = `${SITE_URL}/cli?code=${USER_CODE}`;

/** What `sm install --tools claude,cursor` writes for two Free items. */
const FILES_WRITTEN: Array<{ dir: string; file: string }> = [
  { dir: ".claude/agents/", file: "code-reviewer.md" },
  { dir: ".claude/rules/", file: "typescript-standards.md" },
  { dir: ".cursor/rules/", file: "code-reviewer.mdc" },
  { dir: ".cursor/rules/", file: "typescript-standards.mdc" },
];

function Line({ children }: { children?: ReactNode }) {
  return (
    <>
      {children}
      {"\n"}
    </>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-terminal-muted">{children}</span>;
}

function Ok({ children }: { children: ReactNode }) {
  return <span className="text-terminal-accent">{children}</span>;
}

/** The left rail clack draws between steps. */
function Rail({ children }: { children?: ReactNode }) {
  return (
    <Line>
      <Muted>│</Muted>
      {children}
    </Line>
  );
}

function Input({ children }: { children: ReactNode }) {
  return (
    <Line>
      <span className="select-none text-terminal-muted" aria-hidden>
        {"$ "}
      </span>
      {children}
    </Line>
  );
}

/** clack intro: the title sits on a colored band. */
function Intro({ title }: { title: string }) {
  return (
    <Line>
      <Muted>┌</Muted>
      {"  "}
      <span className="rounded-sm bg-terminal-accent/15 text-terminal-accent">{` ${title} `}</span>
    </Line>
  );
}

export function Terminal({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-terminal-border bg-terminal text-terminal-foreground",
        className,
      )}
    >
      <figcaption className="flex h-10 items-center border-b border-terminal-border px-4 text-xs font-medium text-terminal-muted">
        Example session
      </figcaption>

      <pre
        tabIndex={0}
        role="region"
        aria-label="Terminal output"
        className="overflow-x-auto px-4 py-4 font-mono text-13 leading-[22px] sm:px-5"
      >
        <code>
          <Input>sm login</Input>
          <Intro title="SkillManager Login" />
          <Rail />
          <Line>
            <Muted>●</Muted>
            {"  Open the browser and enter this code:"}
          </Line>
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
          <Line>
            <Ok>◇</Ok>
            {"  Logged in successfully!"}
          </Line>
          <Rail />
          <Line>
            <Muted>└</Muted>
            {"  "}
            <Ok>✓ You are now logged in.</Ok>
          </Line>
          <Line />
          <Input>sm install --tools claude,cursor</Input>
          <Intro title="SkillManager Install" />
          <Rail />
          <Line>
            <Ok>◆</Ok>
            {"  "}
            <span className="font-semibold">Install complete:</span>
          </Line>
          <Rail>
            {"    "}
            <Ok>4 created</Ok>
            {"  0 updated  "}
            <Muted>0 skipped</Muted>
          </Rail>
          <Rail />
          <Line>
            <Muted>└</Muted>
            {"  "}
            <Ok>✓ Agents installed!</Ok>
          </Line>
        </code>
      </pre>

      <div className="border-t border-terminal-border px-4 py-4 sm:px-5">
        <p className="text-xs font-medium text-terminal-muted">Files written</p>
        <ul className="mt-2 font-mono text-13 leading-[22px]">
          {FILES_WRITTEN.map(({ dir, file }) => (
            <li key={dir + file} className="[overflow-wrap:anywhere]">
              <span className="text-terminal-muted">{dir}</span>
              {file}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
