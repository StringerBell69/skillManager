import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import { Dialog } from "@/components/ui/dialog";

interface ConnectDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  /** Set when the plan's device limit is already reached, so the last step would fail. */
  limitNotice?: { plan: string; limit: number; canUpgrade: boolean } | null;
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-subtle text-xs font-medium tabular text-muted-foreground"
        aria-hidden
      >
        {number}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}

export function ConnectDeviceDialog({ open, onClose, limitNotice }: ConnectDeviceDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Connect a device"
      description="Follow these steps on the machine you want to connect."
      className="max-w-lg"
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      {limitNotice ? (
        <Alert tone="warning" className="mb-5">
          Your {limitNotice.plan} plan allows {limitNotice.limit === 1 ? "1 device" : `${limitNotice.limit} devices`} and you
          are at that limit. Revoke a device first
          {limitNotice.canUpgrade ? (
            <>
              {" "}
              or{" "}
              <Link to="/billing" onClick={onClose} className="font-medium text-accent-text underline-offset-4 hover:underline">
                upgrade to Pro
              </Link>
            </>
          ) : null}
          .
        </Alert>
      ) : null}

      <ol className="flex flex-col gap-5">
        <Step number={1} title="Install the CLI">
          <Command command="npm i -g @skillmanager/cli" label="Copy install command" />
          <p className="mt-1.5 text-13 text-muted-foreground">Requires Node.js 20 or later.</p>
        </Step>
        <Step number={2} title="Sign in">
          <Command command="sm login" label="Copy sign-in command" />
        </Step>
        <Step number={3} title="Approve the code">
          <p className="text-13 text-muted-foreground">
            Approve the code in the browser window that opens. Check that it matches the code shown in your terminal.
          </p>
        </Step>
      </ol>
    </Dialog>
  );
}
