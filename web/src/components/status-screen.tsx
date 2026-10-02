import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CircleAlert, CircleCheck, CircleSlash, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

type Tone = "neutral" | "success" | "danger" | "muted";

const TONES: Record<Tone, { icon: LucideIcon; className: string }> = {
  neutral: { icon: Info, className: "bg-muted text-muted-foreground" },
  success: { icon: CircleCheck, className: "bg-success-subtle text-success" },
  danger: { icon: CircleAlert, className: "bg-danger-subtle text-danger" },
  muted: { icon: CircleSlash, className: "bg-muted text-muted-foreground" },
};

interface StatusScreenProps {
  title: string;
  description?: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  children?: ReactNode;
  actions?: ReactNode;
  /** Cover whatever is rendered underneath (used for global failures). */
  overlay?: boolean;
}

/** Full-page message for standalone flows: configuration errors, CLI authorization results. */
export function StatusScreen({ title, description, tone = "neutral", icon, children, actions, overlay = false }: StatusScreenProps) {
  const Icon = icon ?? TONES[tone].icon;

  return (
    <div className={cn("flex min-h-dvh flex-col bg-background", overlay && "fixed inset-0 z-50")}>
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" aria-label="SkillManager home" className="rounded-md">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-[12vh]">
        <div className="w-full max-w-[400px]">
          <div className={cn("mb-5 flex size-10 items-center justify-center rounded-lg", TONES[tone].className)}>
            <Icon className="size-5" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground" tabIndex={-1} data-page-title>
            {title}
          </h1>
          {description ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div> : null}
          {children ? <div className="mt-6">{children}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </main>
    </div>
  );
}
