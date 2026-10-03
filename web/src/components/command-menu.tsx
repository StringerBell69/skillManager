import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
  Blocks,
  Copy,
  CreditCard,
  LayoutGrid,
  LogOut,
  Monitor,
  MonitorSmartphone,
  Moon,
  Search,
  Settings,
  Sun,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { useBilling, useBillingPortal, useCatalogAgents, useCatalogPacks } from "@/hooks/useAccount";
import { useTheme } from "@/lib/theme";
import { signOutAndGo } from "@/lib/clerk-nav";
import { track } from "@/lib/posthog";
import { kindLabel } from "@/components/agents/kinds";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  group: string;
  label: string;
  icon: LucideIcon;
  /** Extra words that should match, e.g. "plan" for Billing. */
  keywords?: string;
  hint?: string;
  run: () => void;
}

const INSTALL_COMMAND = "npm i -g @skillmanager/cli";

function matches(action: Action, query: string): boolean {
  if (!query) return true;
  const haystack = `${action.label} ${action.group} ${action.keywords ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Search and jump anywhere in the app. Opened with ⌘K or Ctrl K, or the sidebar search button. */
export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const listId = useId();
  const navigate = useNavigate();
  const clerk = useClerk();
  const { setPreference } = useTheme();
  const billing = useBilling();
  const agents = useCatalogAgents();
  const packs = useCatalogPacks();
  const portal = useBillingPortal();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState("");

  // Global shortcut.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActiveIndex(0);
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const actions = useMemo<Action[]>(() => {
    const close = () => onOpenChange(false);
    const go = (to: string) => () => {
      close();
      navigate(to);
    };
    const copy = (text: string) => () => {
      close();
      void copyText(text).then((ok) => {
        if (ok) track("command_copied", { command: text, label: "command_menu" });
        setToast(ok ? `Copied “${text}”` : "Could not copy. Select the text and copy it manually.");
      });
    };
    const theme = (value: "light" | "dark" | "system", label: string) => () => {
      close();
      setPreference(value);
      setToast(`${label} theme`);
    };
    const paid = billing.data && billing.data.plan !== "FREE";

    const list: Action[] = [
      { id: "page-overview", group: "Pages", label: "Overview", icon: LayoutGrid, keywords: "home dashboard", run: go("/dashboard") },
      { id: "page-agents", group: "Pages", label: "Agents", icon: Blocks, keywords: "catalog skills rules packs", run: go("/agents") },
      { id: "page-devices", group: "Pages", label: "Devices", icon: MonitorSmartphone, keywords: "machines revoke cli", run: go("/devices") },
      { id: "page-billing", group: "Pages", label: "Billing", icon: CreditCard, keywords: "plan invoices subscription", run: go("/billing") },
      { id: "page-settings", group: "Pages", label: "Settings", icon: Settings, keywords: "profile account email password security sessions", run: go("/settings") },
      { id: "copy-install", group: "Copy a command", label: "Install the CLI", icon: Terminal, hint: INSTALL_COMMAND, keywords: "npm", run: copy(INSTALL_COMMAND) },
      { id: "copy-login", group: "Copy a command", label: "Sign in from the terminal", icon: Terminal, hint: "sm login", keywords: "login device", run: copy("sm login") },
      { id: "copy-sm-install", group: "Copy a command", label: "Install your agents", icon: Terminal, hint: "sm install", run: copy("sm install") },
      { id: "copy-update", group: "Copy a command", label: "Update installed agents", icon: Terminal, hint: "sm update", run: copy("sm update") },
    ];

    for (const agent of agents.data ?? []) {
      list.push({
        id: `agent-${agent.slug}`,
        group: "Agents",
        label: agent.name || agent.slug,
        icon: Blocks,
        hint: kindLabel(agent.kind),
        keywords: `${agent.slug} ${agent.description}`,
        run: go(`/agents?agent=${encodeURIComponent(agent.slug)}`),
      });
    }

    for (const pack of packs.data ?? []) {
      const installCommand = pack.installCommand || `sm install --pack ${pack.slug}`;
      list.push({
        id: `pack-${pack.slug}`,
        group: "Packs",
        label: pack.name || pack.slug,
        icon: Blocks,
        hint: `${pack.agentCount} agents`,
        keywords: `${pack.slug} ${pack.description} pack`,
        run: go("/agents"),
      });
      list.push({
        id: `copy-pack-${pack.slug}`,
        group: "Copy a command",
        label: `Install pack ${pack.name || pack.slug}`,
        icon: Terminal,
        hint: installCommand,
        keywords: `${pack.slug} pack install`,
        run: copy(installCommand),
      });
    }

    list.push(
      paid
        ? {
            id: "account-portal",
            group: "Account",
            label: "Manage subscription",
            icon: CreditCard,
            keywords: "stripe portal invoices payment cancel",
            run: () => {
              close();
              setToast("Opening the billing portal…");
              portal.mutate(undefined, { onError: (error) => setToast(error.message) });
            },
          }
        : { id: "account-upgrade", group: "Account", label: "Upgrade to Pro", icon: CreditCard, keywords: "plan pricing checkout", run: go("/billing") },
      { id: "theme-system", group: "Theme", label: "Use system theme", icon: Monitor, keywords: "appearance auto", run: theme("system", "System") },
      { id: "theme-light", group: "Theme", label: "Use light theme", icon: Sun, keywords: "appearance", run: theme("light", "Light") },
      { id: "theme-dark", group: "Theme", label: "Use dark theme", icon: Moon, keywords: "appearance", run: theme("dark", "Dark") },
      {
        id: "account-sign-out",
        group: "Account",
        label: "Sign out",
        icon: LogOut,
        keywords: "log out logout",
        run: () => {
          close();
          void signOutAndGo(() => clerk.signOut(), navigate, "/");
        },
      },
    );
    return list;
  }, [agents.data, billing.data, clerk, navigate, onOpenChange, packs.data, portal, setPreference]);

  const visible = actions.filter((action) => matches(action, query.trim()));
  const active = visible[Math.min(activeIndex, visible.length - 1)];

  useEffect(() => {
    if (active) optionRefs.current.get(active.id)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (visible.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (Math.min(index, visible.length - 1) + step + visible.length) % visible.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      active?.run();
    }
  };

  const groups: Array<{ name: string; items: Action[] }> = [];
  for (const action of visible) {
    const group = groups.find((entry) => entry.name === action.group);
    if (group) group.items.push(action);
    else groups.push({ name: action.group, items: [action] });
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={() => onOpenChange(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) onOpenChange(false);
        }}
        aria-label="Command menu"
        className={cn(
          "mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-card-edge bg-surface p-0 text-foreground shadow-float",
          "backdrop:bg-black/40 dark:backdrop:bg-black/60 open:animate-[dialog-in_160ms_var(--ease-out-strong)]",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, agents, and actions"
            placeholder="Search pages, agents, and actions…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground"
          />
          <kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">Esc</kbd>
        </div>

        <div id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{query.trim()}”</p>
          ) : (
            groups.map((group) => (
              <div key={group.name} role="group" aria-label={group.name} className="pb-1">
                <div role="presentation" className="px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                  {group.name}
                </div>
                {group.items.map((action) => {
                  const selected = action === active;
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      ref={(node) => {
                        if (node) optionRefs.current.set(action.id, node);
                        else optionRefs.current.delete(action.id);
                      }}
                      id={`${listId}-${action.id}`}
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => setActiveIndex(visible.indexOf(action))}
                      onClick={() => action.run()}
                      className={cn(
                        "flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-sm",
                        selected ? "bg-muted text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-foreground">{action.label}</span>
                      {action.hint ? (
                        <span className="truncate font-mono text-xs text-muted-foreground">{action.hint}</span>
                      ) : null}
                      {action.group === "Copy a command" ? <Copy className="size-3.5 shrink-0" aria-hidden /> : null}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-subtle px-4 py-2 text-xs text-muted-foreground">
          <span>
            <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to move
          </span>
          <span>
            <kbd className="font-mono">↵</kbd> to select
          </span>
        </div>
      </dialog>

      {/* Feedback for actions that do not change the page (copy, theme). */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-6"
      >
        {toast ? (
          <p className="animate-[fade-in_200ms_var(--ease-out-strong)] rounded-full border border-card-edge bg-surface px-4 py-2.5 text-13 text-foreground shadow-float">
            {toast}
          </p>
        ) : null}
      </div>
    </>
  );
}
