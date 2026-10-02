import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

/** Frame for Clerk's sign-in and sign-up cards. Clerk renders the page heading. */
export function AuthPage({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="SkillManager home" className="rounded-md">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-[8vh]">
        {/* Reserve the card's height so the page does not jump while Clerk loads. */}
        <div className="flex min-h-[520px] w-full max-w-[400px] flex-col items-center">{children}</div>
        {footer ? <div className="mt-6 text-center text-[13px] text-muted-foreground">{footer}</div> : null}
      </main>
    </div>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="w-full rounded-xl border border-card-edge bg-surface p-8 shadow-card" aria-hidden>
      <Skeleton className="mx-auto h-5 w-40" />
      <Skeleton className="mx-auto mt-3 h-4 w-56" />
      <Skeleton className="mt-8 h-9 w-full" />
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="mt-6 h-9 w-full" />
      <Skeleton className="mt-3 h-9 w-full" />
    </div>
  );
}
