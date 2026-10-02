import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CONTAINER, INSTALL_COMMAND } from "./layout";

const LINK =
  "inline-flex min-h-6 items-center rounded-md text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Supported tools", href: "/#tools" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/signup" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Billing", to: "/billing" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Billing questions", href: "/pricing#billing-faq" },
      { label: "Connect the CLI", to: "/cli" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className={cn(CONTAINER, "py-14")}>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" aria-label="SkillManager home" className="-mx-1 inline-flex rounded-md px-1 py-1">
              <Logo />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Installs AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI.
            </p>
            <Command command={INSTALL_COMMAND} label="Copy install command" className="mt-5 w-full max-w-sm bg-surface" />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-medium text-foreground">{column.title}</h2>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {"to" in link ? (
                        <Link to={link.to} className={LINK}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={LINK}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-13 text-muted-foreground tabular">© {__BUILD_YEAR__} SkillManager</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
