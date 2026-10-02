import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { RedirectToSignIn, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { Blocks, CreditCard, LayoutGrid, Menu, MonitorSmartphone, Search, Settings, X, type LucideIcon } from "lucide-react";
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map(({ label, to, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
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
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
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

function Account() {
  const { user } = useUser();
  const name = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <UserButton
        userProfileMode="navigation"
        userProfileUrl="/settings"
        appearance={{ elements: { userButtonAvatarBox: { width: "1.75rem", height: "1.75rem" } } }}
      />
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
      className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-muted-foreground shadow-xs transition-colors duration-150 hover:text-foreground"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-left">Search…</span>
      <kbd className="font-mono text-[11px] text-faint-foreground">{commandMenuShortcut()}</kbd>
    </button>
  );
}

function SidebarContent({ onNavigate, onSearch }: { onNavigate?: () => void; onSearch: () => void }) {
  return (
    <div className="flex h-full flex-col gap-5 px-3 py-4">
      <Link to="/dashboard" onClick={onNavigate} className="flex h-8 items-center rounded-md px-1.5" aria-label="SkillManager overview">
        <Logo />
      </Link>
      <SearchButton
        onClick={() => {
          onNavigate?.();
          onSearch();
        }}
      />
      <nav aria-label="Main" className="flex-1">
        <NavLinks onNavigate={onNavigate} />
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
    </div>
  );
}

function MobileDrawer({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label="Navigation"
      className={cn(
        "m-0 h-dvh max-h-dvh w-72 max-w-[85vw] border-r border-border bg-subtle p-0 text-foreground shadow-float",
        "backdrop:bg-black/40 open:animate-[drawer-in_240ms_var(--ease-out-strong)] lg:hidden",
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Close navigation"
      >
        <X className="size-4" aria-hidden />
      </button>
      <SidebarContent onNavigate={onClose} onSearch={onSearch} />
    </dialog>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useRouteFocus();

  if (!isLoaded) return <FullPageSpinner />;
  // Sends the visitor to /login with a redirect_url back to this page.
  if (!isSignedIn) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-subtle lg:block">
        <SidebarContent onSearch={() => setMenuOpen(true)} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
        <Link to="/dashboard" aria-label="SkillManager overview">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSearch={() => setMenuOpen(true)} />
      <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />

      <main id="main" className="lg:pl-60">
        <div className="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
