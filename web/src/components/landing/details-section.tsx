import type { ReactNode } from "react";
import { Code, Section, SectionHeading } from "./layout";

const DETAILS: Array<{ term: string; description: ReactNode }> = [
  {
    term: "Your edits stay yours",
    description: (
      <>
        SkillManager records a content hash for every file it installs. If you changed one, <Code>sm install</Code> asks
        before overwriting it. Pass <Code>--force</Code> to overwrite without asking.
      </>
    ),
  },
  {
    term: "Preview first",
    description: (
      <>
        <Code>--dry-run</Code> lists each file that would be created or updated, and writes nothing.
      </>
    ),
  },
  {
    term: "Project or global",
    description: (
      <>
        Files go into the current project by default. Add <Code>--global</Code> to install them in your home directory
        instead.
      </>
    ),
  },
  {
    term: "Works in scripts",
    description: (
      <>
        <Code>--yes</Code> skips the prompts. Without a TTY the CLI prints plain one-line output, so it fits in setup
        scripts.
      </>
    ),
  },
  {
    term: "Remove cleanly",
    description: (
      <>
        <Code>{"sm remove <slug>"}</Code> deletes the item's own files and takes its section out of shared files. The
        rest of those files is left as it was.
      </>
    ),
  },
  {
    term: "Manage your machines",
    description:
      "The Devices page lists every connected machine with when it was last used and whether it is active. Revoke one to disconnect it.",
  },
];

export function DetailsSection() {
  return (
    <Section labelledBy="details-title">
      <SectionHeading id="details-title" title="Predictable on every machine">
        The CLI only touches the files it manages, and <Code>sm install</Code> asks before it replaces one you edited.
      </SectionHeading>

      <dl className="mt-14 grid gap-x-12 sm:grid-cols-2">
        {DETAILS.map(({ term, description }) => (
          <div key={term} className="border-t border-border py-6">
            <dt className="text-[15px] font-semibold tracking-tight text-foreground">{term}</dt>
            <dd className="mt-2 max-w-[56ch] text-sm leading-6 text-muted-foreground">{description}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
