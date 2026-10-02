import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { CONTAINER } from "./layout";

const LINK = "inline-flex min-h-6 items-center rounded-md text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className={cn(CONTAINER, "py-12")}>
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link to="/" aria-label="SkillManager home" className="-mx-1 inline-flex rounded-md px-1 py-1">
            <Logo />
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Installs AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            <li>
              <a href="#how-it-works" className={LINK}>
                How it works
              </a>
            </li>
            <li>
              <a href="#pricing" className={LINK}>
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className={LINK}>
                FAQ
              </a>
            </li>
            <li>
              <Link to="/login" className={LINK}>
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/signup" className={LINK}>
                Create account
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-13 text-muted-foreground tabular">© {__BUILD_YEAR__} SkillManager</p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
