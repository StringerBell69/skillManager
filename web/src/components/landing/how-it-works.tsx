import type { ReactNode } from "react";
import { Code, INSTALL_COMMAND, Section, SectionHeading } from "./layout";

interface Step {
  title: string;
  command: string;
  body: ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Install the CLI",
    command: INSTALL_COMMAND,
    body: (
      <>
        Adds the <Code>sm</Code> command, also available as <Code>skillmanager</Code>.
      </>
    ),
  },
  {
    title: "Sign in",
    command: "sm login",
    body: "The CLI shows a code and opens your browser. Approve the code there to connect this machine to your account.",
  },
  {
    title: "Install your agents",
    command: "sm install",
    body: (
      <>
        Choose the tools you use, or pass <Code>--tools</Code> to skip the question. Everything on your plan is written for
        each tool you chose.
      </>
    ),
  },
  {
    title: "Stay current",
    command: "sm update",
    body: "Pulls the latest version of every agent you installed, for the same tools and in the same places.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-it-works-title">
      <SectionHeading id="how-it-works-title" title="Three commands to set up, one to stay current">
        Everything runs from the CLI. The dashboard is where you see the catalog, your connected devices, and your plan.
      </SectionHeading>

      <ol className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.command} className="flex min-w-0 flex-col border-t border-border-strong pb-10 pt-5 lg:pb-0">
            <span className="font-mono text-13 text-muted-foreground tabular" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-foreground">{step.title}</h3>
            <p className="mt-3">
              <code className="inline-block max-w-full rounded-md border border-border bg-subtle px-2 py-1 font-mono text-13 text-foreground [overflow-wrap:anywhere]">
                {step.command}
              </code>
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
