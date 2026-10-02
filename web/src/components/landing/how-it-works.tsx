import { useId, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTALL_COMMAND, Section, SectionHeading } from "./layout";
import { InstallCliScene, ProjectTreeScene, SignInScene, UpdateScene, type SceneProps } from "./scenes";
import { useInView, useLoopClock, usePageVisible, usePrefersReducedMotion } from "./use-animation";

interface Step {
  title: string;
  command: string;
  body: string;
  Scene: ComponentType<SceneProps>;
}

const STEPS: Step[] = [
  {
    title: "Install the CLI",
    command: INSTALL_COMMAND,
    body: "Adds the sm command to your terminal. It needs Node.js 20 or later.",
    Scene: InstallCliScene,
  },
  {
    title: "Sign in from your terminal",
    command: "sm login",
    body: "The CLI shows a one-time code and opens your browser. Approve the code there and this machine is connected.",
    Scene: SignInScene,
  },
  {
    title: "Install your agents",
    command: "sm install",
    body: "Choose your tools. Everything on your plan is written where each tool reads it, and a manifest records what was installed.",
    Scene: ProjectTreeScene,
  },
  {
    title: "Stay current",
    command: "sm update",
    body: "Pulls the newer versions of the agents you installed, for the same tools and in the same places.",
    Scene: UpdateScene,
  },
];

const STEP_MS = 7000;

export function HowItWorks() {
  const baseId = useId();
  const sectionRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const inView = useInView(sectionRef);
  const [chosen, setChosen] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  // Steps advance on their own until the visitor picks one.
  const autoplay = !reducedMotion && chosen === null;
  const clock = useLoopClock(STEPS.length * STEP_MS, autoplay && !paused && inView && pageVisible);
  const selected = chosen ?? (autoplay ? Math.floor(clock / STEP_MS) : 0);
  const elapsed = autoplay ? clock % STEP_MS : Number.POSITIVE_INFINITY;

  const choose = (index: number, focus = false) => {
    setChosen(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = STEPS.length - 1;
    const next = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: last }[
      event.key
    ];
    if (next === undefined) return;
    event.preventDefault();
    choose((next + STEPS.length) % STEPS.length, true);
  };

  return (
    <Section id="how-it-works" labelledBy="how-title">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading id="how-title" title="From a new machine to installed agents in four commands">
          Everything runs from the CLI. The dashboard is where you see your catalog, your devices, and your plan.
        </SectionHeading>
        {autoplay ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-md px-2.5 text-13 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:self-auto"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            {paused ? "Resume" : "Pause"}
            <span className="sr-only"> step autoplay</span>
          </button>
        ) : null}
      </div>

      <div ref={sectionRef} className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        <div role="tablist" aria-label="Steps" aria-orientation="vertical" className="flex flex-col lg:col-span-5">
          {STEPS.map((step, index) => {
            const active = index === selected;
            return (
              <button
                key={step.title}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={active}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={active ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "group relative flex gap-4 border-t border-border py-5 text-left transition-colors duration-150",
                  "focus-visible:outline-offset-[-2px]",
                )}
              >
                {/* Progress along the top edge while the step plays on its own. */}
                <span className="absolute inset-x-0 -top-px h-px overflow-hidden" aria-hidden>
                  <span
                    className={cn("block h-full bg-foreground", active ? "opacity-100" : "opacity-0")}
                    style={{ width: active ? (autoplay ? `${Math.min((elapsed / STEP_MS) * 100, 100)}%` : "100%") : "0%" }}
                  />
                </span>
                <span
                  className={cn(
                    "pt-0.5 font-mono text-xs tabular",
                    active ? "text-foreground" : "text-faint-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[15px] font-semibold tracking-tight transition-colors",
                      active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{step.body}</span>
                  <code
                    className={cn(
                      "mt-3 inline-block rounded-md border px-2 py-0.5 font-mono text-[12.5px] transition-colors",
                      active ? "border-border-strong bg-surface text-foreground" : "border-border bg-transparent text-muted-foreground",
                    )}
                  >
                    {step.command}
                  </code>
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
          {STEPS.map(({ title, Scene }, index) => (
            <div
              key={title}
              role="tabpanel"
              id={`${baseId}-panel-${index}`}
              aria-labelledby={`${baseId}-tab-${index}`}
              hidden={index !== selected}
              tabIndex={0}
              className="animate-[fade-in_250ms_var(--ease-out-strong)] rounded-lg"
            >
              <Scene elapsed={index === selected ? elapsed : Number.POSITIVE_INFINITY} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
