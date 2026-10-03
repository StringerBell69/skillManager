import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { Blocks, CreditCard, LayoutGrid, MonitorSmartphone, Search, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { planLabel } from "@/lib/format";
import { useBilling } from "@/hooks/useAccount";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner } from "@/components/ui/spinner";
import { CommandMenu } from "@/components/command-menu";
import { commandMenuShortcut } from "@/lib/platform";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: "Overview", to: "/dashboard", icon: LayoutGrid },
  { label: "Agents", to: "/agents", icon: Blocks },
  { label: "Devices", to: "/devices", icon: MonitorSmartphone },
  { label: "Billing", to: "/billing", icon: CreditCard },
  { label: "Settings", to: "/settings", icon: Settings },
];

function NavLinks() {
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map(({ label, to, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) =>
              cn(
                "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn("size-4 shrink-0", isActive ? "text-foreground" : "text-faint-foreground group-hover:text-foreground")}
                  aria-hidden
                />
                {label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function PlanCard() {
  const { data } = useBilling();
  if (!data) return <div className="h-[74px]" aria-hidden />;

  const isFree = data.plan === "FREE";
  return (
    <div className="rounded-lg border border-card-edge bg-surface p-3 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Plan</span>
        <Badge variant={isFree ? "neutral" : "accent"}>{planLabel(data.plan)}</Badge>
      </div>
      <Link
        to="/billing"
        className="mt-2 block text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
      >
        {isFree ? "Upgrade to Pro" : "Manage subscription"}
      </Link>
    </div>
  );
}

function AccountButton() {
  return (
    <UserButton
      userProfileMode="navigation"
      userProfileUrl="/settings"
      appearance={{ elements: { userButtonAvatarBox: { width: "1.75rem", height: "1.75rem" } } }}
    />
  );
}

function Account() {
  const { user } = useUser();
  const name = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AccountButton />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
        {email && email !== name ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
      </div>
    </div>
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-full items-center gap-2 rounded-md bg-muted px-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-border hover:text-foreground"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-left">Search…</span>
      <kbd className="font-mono text-[11px] text-muted-foreground">{commandMenuShortcut()}</kbd>
    </button>
  );
}

function Sidebar({ onSearch }: { onSearch: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-5 border-r border-border bg-subtle px-3 py-4 lg:flex">
      <Link to="/dashboard" className="flex h-8 items-center rounded-md px-1.5" aria-label="SkillManager overview">
        <Logo />
      </Link>
      <SearchButton onClick={onSearch} />
      <nav aria-label="Main" className="flex-1">
        <NavLinks />
      </nav>
      <div className="flex flex-col gap-3">
        <PlanCard />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <div className="border-t border-border px-1 pt-3">
          <Account />
        </div>
      </div>
    </aside>
  );
}

/** Translucent material for the phone bars, like iOS navigation and tab bars. */
const BAR_MATERIAL = "border-border/80 bg-background/80 backdrop-blur-xl backdrop-saturate-180";

function MobileTopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <header className={cn("sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] lg:hidden", BAR_MATERIAL)}>
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <Link to="/dashboard" className="-mx-1 rounded-md px-1 py-1" aria-label="SkillManager overview">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <AccountButton />
        </div>
      </div>
    </header>
  );
}

/** Bottom tab bar on phones and small tablets: every section stays one thumb tap away. */
function TabBar() {
  return (
    <nav
      aria-label="Main"
      className={cn("fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden", BAR_MATERIAL)}
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-5 px-1">
        {NAV.map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex h-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors duration-150",
                  isActive ? "text-accent-text" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-[22px]" strokeWidth={isActive ? 2.1 : 1.7} aria-hidden />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Move focus to the new page heading after client-side navigation, so screen readers announce it. */
function useRouteFocus() {
  const { pathname } = useLocation();
  // Track the last path rather than a "first run" flag, so StrictMode's double effect does not count as navigation.
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const heading = document.querySelector<HTMLElement>("[data-page-title]");
    heading?.focus({ preventScroll: true });
    document.getElementById("main")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);
}

export default function AppShell() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useRouteFocus();

  if (!isLoaded) return <FullPageSpinner />;
  if (!isSignedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect_url=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>

      <Sidebar onSearch={() => setMenuOpen(true)} />
      <MobileTopBar onSearch={() => setMenuOpen(true)} />
      <TabBar />
      <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />

      {/* On phones, the bottom padding keeps the end of the page clear of the tab bar. */}
      <main id="main" className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-60">
        <div className="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
