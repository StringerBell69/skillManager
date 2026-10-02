import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/logo";

/**
 * Same frame as StatusScreen (logo header, 400px left-aligned column), so moving
 * between the approval screen and a result screen does not shift the layout.
 */
export function CliFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" aria-label="SkillManager home" className="rounded-md">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-[12vh]">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}

export function CliHeading({ title, description }: { title: string; description: ReactNode }) {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground outline-none" tabIndex={-1} data-page-title>
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </>
  );
}

/** A command or code named inside running text, e.g. "Run sm login". */
export function InlineCode({ children }: { children: string }) {
  return <code className="font-mono text-[13px] text-foreground">{children}</code>;
}
