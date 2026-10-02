import { cn } from "@/lib/utils";
import { Code, LANDING_BODY, PathLabel, Section, SectionHeading } from "./layout";

type WriteMode = "Own file" | "Marked section";

interface ToolRow {
  tool: string;
  mode: WriteMode;
  /** One path per kind, or a single path shared by all three kinds. */
  paths: { agents: string; skills: string; rules: string } | string;
}

const ROWS: ToolRow[] = [
  {
    tool: "Claude Code",
    mode: "Own file",
    paths: {
      agents: ".claude/agents/<name>.md",
      skills: ".claude/skills/<name>/SKILL.md",
      rules: ".claude/rules/<name>.md",
    },
  },
  { tool: "Codex", mode: "Marked section", paths: "AGENTS.md" },
  { tool: "Cursor", mode: "Own file", paths: ".cursor/rules/<name>.mdc" },
  { tool: "Gemini CLI", mode: "Marked section", paths: "GEMINI.md" },
];

const TH = "px-4 py-2.5 text-left text-xs font-medium text-muted-foreground";
const TD = "px-4 py-3.5 align-top";

function ToolsTable() {
  return (
    <div
      role="region"
      aria-labelledby="tools-table-caption"
      tabIndex={0}
      className="mt-12 overflow-x-auto rounded-lg border border-border bg-surface shadow-xs"
    >
      <table className="w-full min-w-[720px] border-collapse text-13">
        <caption id="tools-table-caption" className="sr-only">
          Where sm install writes agents, skills, and rules for each tool
        </caption>
        <thead className="border-b border-border bg-subtle">
          <tr>
            <th scope="col" className={TH}>
              Tool
            </th>
            <th scope="col" className={TH}>
              Agents
            </th>
            <th scope="col" className={TH}>
              Skills
            </th>
            <th scope="col" className={TH}>
              Rules
            </th>
            <th scope="col" className={TH}>
              How it is written
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ROWS.map((row) => (
            <tr key={row.tool}>
              <th scope="row" className={cn(TD, "whitespace-nowrap text-left font-medium text-foreground")}>
                {row.tool}
              </th>
              {typeof row.paths === "string" ? (
                <td colSpan={3} className={TD}>
                  <PathLabel path={row.paths} />
                  <span className="ml-3 text-muted-foreground">Agents, skills, and rules</span>
                </td>
              ) : (
                <>
                  <td className={TD}>
                    <PathLabel path={row.paths.agents} />
                  </td>
                  <td className={TD}>
                    <PathLabel path={row.paths.skills} />
                  </td>
                  <td className={TD}>
                    <PathLabel path={row.paths.rules} />
                  </td>
                </>
              )}
              <td className={cn(TD, "whitespace-nowrap text-foreground")}>{row.mode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Lines of an example AGENTS.md. `managed` marks the block SkillManager owns. */
const AGENTS_MD: Array<{ text: string; managed: boolean; tone?: "marker" | "muted" }> = [
  { text: "# Team conventions", managed: false },
  { text: "Run the tests before you push.", managed: false },
  { text: "", managed: false },
  { text: "<!-- skillmanager:start:code-reviewer -->", managed: true, tone: "marker" },
  { text: "## Code reviewer", managed: true },
  { text: "…", managed: true, tone: "muted" },
  { text: "<!-- skillmanager:end:code-reviewer -->", managed: true, tone: "marker" },
];

function MarkedFile() {
  return (
    <figure className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
      <figcaption className="flex h-10 items-center justify-between gap-4 border-b border-border bg-subtle px-4 text-xs">
        <span className="font-mono text-foreground">AGENTS.md</span>
        <span className="text-muted-foreground">Example</span>
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label="Example AGENTS.md with one installed section"
        className="overflow-x-auto py-3 font-mono text-13 leading-6"
      >
        <code className="block w-max min-w-full">
          {AGENTS_MD.map((line, index) => (
            <span
              key={index}
              className={cn(
                "block border-l-2 pl-4 pr-4",
                line.managed ? "border-accent bg-accent-subtle" : "border-border-strong",
                line.tone === "marker" && "text-accent-text",
                line.tone === "muted" && "text-muted-foreground",
                !line.tone && "text-foreground",
              )}
            >
              {line.text || " "}
            </span>
          ))}
        </code>
      </pre>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-0.5 rounded-full bg-accent" aria-hidden />
          Managed by SkillManager
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-0.5 rounded-full bg-border-strong" aria-hidden />
          Left as you wrote it
        </span>
      </div>
    </figure>
  );
}

export function ToolsSection() {
  return (
    <Section id="tools" labelledBy="tools-title">
      <SectionHeading id="tools-title" title="Installed where each tool looks">
        Claude Code and Cursor get one file per item. Codex and Gemini CLI each read a single shared file, so SkillManager
        writes a marked section there and leaves the rest of the file alone.
      </SectionHeading>

      <ToolsTable />

      <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <div className="max-w-[60ch]">
          <h3 className="text-[17px] font-semibold tracking-tight text-foreground">Shared files stay yours</h3>
          <p className={cn("mt-3 text-muted-foreground", LANDING_BODY)}>
            Each item in <Code>AGENTS.md</Code> or <Code>GEMINI.md</Code> sits between its own start and end markers.
            Content outside the markers is never touched, and running <Code>sm install</Code> again replaces only that
            block.
          </p>
        </div>
        <MarkedFile />
      </div>
    </Section>
  );
}
