import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { InlineCode } from "@/components/agents/inline-code";

interface Step {
  title: string;
  body: string;
  command: string;
  copyLabel: string;
}

const STEPS: Step[] = [
  {
    title: "Install the CLI",
    body: "Adds the sm command to your terminal. Requires Node.js 20 or later.",
    command: "npm i -g @skillmanager/cli",
    copyLabel: "Copy install command",
  },
  {
    title: "Sign in from your terminal",
    body: "Your browser opens with a code. Check that it matches your terminal, then approve it.",
    command: "sm login",
    copyLabel: "Copy sign-in command",
  },
  {
    title: "Install your agents",
    body: "Run this inside a project to add every agent on your plan to your coding tools.",
    command: "sm install",
    copyLabel: "Copy agent install command",
  },
];

/** Index of the step whose state the API can confirm: signing in creates a device. */
const SIGN_IN_STEP = 1;

interface SetupCardProps {
  /** `true` once a device is connected, `null` while unknown. */
  connected: boolean | null;
  loading?: boolean;
}

export function SetupCard({ connected, loading = false }: SetupCardProps) {
  return (
    <Card>
      <CardHeader className="block">
        <CardTitle>Set up the CLI</CardTitle>
        {loading ? (
          <div className="mt-1 flex h-5 items-center" aria-hidden>
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </div>
        ) : connected ? (
          <CardDescription>
            Your CLI is connected. Run <InlineCode>sm install</InlineCode> in a project to add your agents.
          </CardDescription>
        ) : (
          <CardDescription>Three commands connect your terminal to this account and install your agents.</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {STEPS.map((step, index) => {
            const done = index === SIGN_IN_STEP && connected === true;
            const last = index === STEPS.length - 1;
            return (
              <li
                key={step.command}
                className={cn("relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3.5", last ? null : "pb-6")}
              >
                {last ? null : (
                  // Connector between step markers. On phones the body runs full width, so it is hidden there.
                  <span
                    className="absolute bottom-1 left-3 top-7 hidden w-px -translate-x-1/2 bg-border sm:block"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-md border text-xs font-medium tabular",
                    done
                      ? "border-transparent bg-success-subtle text-success"
                      : "border-border-strong bg-surface text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
                </span>
                <div className="flex min-h-6 flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <h3 className="text-sm font-medium text-foreground">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  {done ? <span className="text-xs font-medium text-success">Connected</span> : null}
                </div>
                <div className="col-span-2 mt-1.5 sm:col-span-1 sm:col-start-2 sm:mt-0.5">
                  <p className="text-13 text-muted-foreground">{step.body}</p>
                  <Command command={step.command} label={step.copyLabel} className="mt-3" />
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
