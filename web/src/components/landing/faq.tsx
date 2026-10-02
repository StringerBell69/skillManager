import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Code, Section, SectionHeading } from "./layout";

const QUESTIONS: Array<{ question: string; answer: ReactNode }> = [
  {
    question: "Which coding tools are supported?",
    answer: (
      <>
        Claude Code, Codex, Cursor, and Gemini CLI. <Code>sm install</Code> asks which ones you use, or you can name them
        with <Code>--tools claude,codex,cursor,gemini</Code>.
      </>
    ),
  },
  {
    question: "Where are the files written?",
    answer: (
      <>
        In the project you run <Code>sm install</Code> from, or in your home directory with <Code>--global</Code>. Claude
        Code gets files in <Code>.claude/agents</Code>, <Code>.claude/skills</Code>, and <Code>.claude/rules</Code>.
        Cursor gets <Code>{".cursor/rules/<name>.mdc"}</Code> files. Codex and Gemini CLI get a marked section in{" "}
        <Code>AGENTS.md</Code> and <Code>GEMINI.md</Code>.
      </>
    ),
  },
  {
    question: "What happens to files I edited?",
    answer: (
      <>
        SkillManager records a content hash for each file it installs. If a file changed since then,{" "}
        <Code>sm install</Code> asks before overwriting it. When there is nobody to ask, as in a script, the file is
        skipped. Pass <Code>--force</Code> to overwrite it anyway.
      </>
    ),
  },
  {
    question: "How many machines can I connect?",
    answer:
      "One on the Free plan. Pro has no device limit. The Devices page in your dashboard shows when each machine was last used and whether it is active, and lets you revoke it.",
  },
  {
    question: "How do I remove an agent?",
    answer: (
      <>
        Run <Code>{"sm remove <slug>"}</Code>. Its own files are deleted and its marked sections are taken out of shared
        files, leaving the rest of those files unchanged.
      </>
    ),
  },
  {
    question: "How do I cancel Pro?",
    answer: (
      <>
        Open{" "}
        <Link to="/billing" className="font-medium text-accent-text underline underline-offset-4">
          Billing
        </Link>{" "}
        in your dashboard and go to the Stripe billing portal. You can cancel there, change your payment method, and
        download invoices.
      </>
    ),
  },
];

export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <SectionHeading id="faq-title" title="Common questions" />

        <div className="border-b border-border">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className="group border-t border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-5 text-[15px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="max-w-[64ch] pb-6 pr-10 text-sm leading-6 text-muted-foreground">{answer}</div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
