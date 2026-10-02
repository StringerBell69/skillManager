import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { CONTAINER } from "./layout";

const NAV_LINK =
  "inline-flex h-8 items-center rounded-full px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground";

// Absolute anchors work from every public page; on the home page they only scroll.
const SECTION_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl backdrop-saturate-180">
      <div className={cn(CONTAINER, "flex h-16 items-center gap-4 md:gap-8")}>
        <Link to="/" aria-label="SkillManager home" className="-mx-1 rounded-md px-1 py-1">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {SECTION_LINKS.slice(0, 2).map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={NAV_LINK}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <NavLink to="/pricing" className={({ isActive }) => cn(NAV_LINK, isActive && "text-foreground")}>
                Pricing
              </NavLink>
            </li>
            <li>
              <a href={SECTION_LINKS[2].href} className={NAV_LINK}>
                {SECTION_LINKS[2].label}
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              cn(buttonVariants({ variant: "ghost", size: "sm" }), "max-sm:h-10 max-sm:px-2.5 md:hidden", isActive && "text-foreground")
            }
          >
            Pricing
          </NavLink>
          <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "max-sm:h-10 max-sm:px-2.5")}>
            Sign in
          </Link>
          <Link to="/signup" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "max-sm:h-10 max-sm:px-2.5")}>
            <span className="sm:hidden">Sign up</span>
            <span className="hidden sm:inline">Create free account</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
