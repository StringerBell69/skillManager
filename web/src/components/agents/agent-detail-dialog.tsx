import type { UnlockedAgent } from "@skillmanager/shared/browser";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import { Dialog } from "@/components/ui/dialog";
import { AgentVersion, KindBadge, PlanRequiredBadge } from "./agent-meta";
import { installTargets } from "./install-paths";

interface AgentDetailDialogProps {
  agent: UnlockedAgent | null;
  onClose: () => void;
}

export function AgentDetailDialog({ agent, onClose }: AgentDetailDialogProps) {
  const targets = agent ? installTargets(agent.kind, agent.slug) : [];

  return (
    <Dialog
      open={agent !== null}
      onClose={onClose}
      title={agent ? agent.name || agent.slug : ""}
      className="max-w-lg"
      description={agent?.description || undefined}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {agent ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge kind={agent.kind} />
            <PlanRequiredBadge plan={agent.planRequired} />
            <AgentVersion version={agent.latestVersion} />
            <code className="ml-auto font-mono text-xs text-muted-foreground">{agent.slug}</code>
          </div>

          <section aria-labelledby="agent-targets-title">
            <h3 id="agent-targets-title" className="text-13 font-medium text-foreground">
              Where it is installed
            </h3>
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
              {targets.map((target) => (
                <li key={target.tool} className="flex flex-col gap-0.5 px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
                  <span className="w-24 shrink-0 text-13 font-medium text-foreground">{target.tool}</span>
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{target.path}</code>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {target.mode === "file" ? "Own file" : "Marked section"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Shared files get a block between{" "}
              <code className="font-mono">{`<!-- skillmanager:start:${agent.slug} -->`}</code> and its end marker. The
              rest of the file is left alone.
            </p>
          </section>

          <section aria-labelledby="agent-commands-title" className="flex flex-col gap-2">
            <h3 id="agent-commands-title" className="text-13 font-medium text-foreground">
              Commands
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">Installs everything on your plan, this item included.</p>
            <Command command="sm install" label="Copy install command" />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Removes this item from the current project.</p>
            <Command command={`sm remove ${agent.slug}`} label={`Copy remove command for ${agent.slug}`} />
          </section>
        </div>
      ) : null}
    </Dialog>
  );
}
