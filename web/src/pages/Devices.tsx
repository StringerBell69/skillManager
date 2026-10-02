import { useEffect, useRef, useState } from "react";
import { MonitorSmartphone, Plus, X } from "lucide-react";
import type { DeviceInfo } from "@skillmanager/shared/browser";
import { useDevices, useRevokeDevice } from "@/hooks/useAccount";
import { planLabel } from "@/lib/format";
import { AppSeo } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConnectDeviceDialog } from "@/components/devices/connect-device-dialog";
import { DeviceLimitCard, DeviceLimitCardSkeleton } from "@/components/devices/device-limit-card";
import { DeviceListSkeleton, DeviceStackedList, DeviceTable } from "@/components/devices/device-list";
import { ACTIVE_WINDOW_MINUTES, deviceName, isAtDeviceLimit } from "@/components/devices/format";
import { RevokeDeviceDialog } from "@/components/devices/revoke-device-dialog";

export default function Devices() {
  const devices = useDevices();
  const revoke = useRevokeDevice();

  const [connectOpen, setConnectOpen] = useState(false);
  const [target, setTarget] = useState<DeviceInfo | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // The revoked row disappears, taking the focused button with it. Send focus
  // to the list instead so keyboard users keep their place.
  const listRef = useRef<HTMLElement>(null);
  const focusList = useRef(false);
  useEffect(() => {
    if (target === null && focusList.current) {
      focusList.current = false;
      listRef.current?.focus();
    }
  }, [target, confirmation]);

  const openRevoke = (device: DeviceInfo) => {
    revoke.reset();
    setTarget(device);
  };

  const closeRevoke = () => setTarget(null);

  const confirmRevoke = (device: DeviceInfo) => {
    revoke.mutate(device.id, {
      onSuccess: () => {
        setConfirmation(`${deviceName(device)} was revoked.`);
        focusList.current = true;
        setTarget(null);
      },
    });
  };

  const dismissConfirmation = () => {
    setConfirmation(null);
    listRef.current?.focus();
  };

  const data = devices.data;
  const limitNotice =
    data && data.deviceLimit !== null && isAtDeviceLimit(data)
      ? { plan: planLabel(data.plan), limit: data.deviceLimit, canUpgrade: data.plan === "FREE" }
      : null;

  return (
    <>
      <AppSeo title="Devices" />
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Devices"
          description="Machines where the SkillManager CLI is signed in. Revoke a device to sign it out."
          actions={
            <Button variant="secondary" onClick={() => setConnectOpen(true)}>
              <Plus aria-hidden />
              Connect a device
            </Button>
          }
        />

        {data ? (
          <>
            <DeviceLimitCard data={data} />

            <section ref={listRef} tabIndex={-1} aria-label="Connected devices" className="flex flex-col rounded-lg">
              {/* Always mounted so screen readers announce the confirmation when it appears. */}
              <div aria-live="polite" aria-atomic="true">
                {confirmation ? (
                  <Alert
                    tone="success"
                    title={confirmation}
                    // The wrapper is the live region; a second role here would announce twice.
                    role={undefined}
                    className="mb-3"
                    action={
                      <Button variant="ghost" size="icon-sm" onClick={dismissConfirmation} aria-label="Dismiss" className="-my-1 -mr-2">
                        <X aria-hidden />
                      </Button>
                    }
                  />
                ) : null}
              </div>

              {data.devices.length === 0 ? (
                <div className="rounded-xl border border-card-edge bg-surface shadow-card">
                  <EmptyState
                    icon={MonitorSmartphone}
                    title="No devices connected"
                    description={
                      <>
                        Run <code className="text-foreground">sm login</code> in your terminal to connect this machine.
                      </>
                    }
                    action={<Command command="sm login" label="Copy sign-in command" className="w-64 max-w-full" />}
                  />
                </div>
              ) : (
                <>
                  <DeviceTable devices={data.devices} onRevoke={openRevoke} />
                  <DeviceStackedList devices={data.devices} onRevoke={openRevoke} />
                  <p className="mt-3 text-13 text-muted-foreground">
                    Active means the CLI on that device reached SkillManager in the last {ACTIVE_WINDOW_MINUTES} minutes.
                  </p>
                </>
              )}
            </section>
          </>
        ) : devices.isError ? (
          <Alert
            tone="danger"
            title="Could not load your devices"
            action={
              <Button variant="secondary" size="sm" onClick={() => void devices.refetch()} loading={devices.isFetching}>
                Try again
              </Button>
            }
          >
            {devices.error.message || "Something went wrong on our side. Try again in a moment."}
          </Alert>
        ) : (
          <>
            <span className="sr-only" role="status">
              Loading devices…
            </span>
            <DeviceLimitCardSkeleton />
            <DeviceListSkeleton />
          </>
        )}
      </div>

      <ConnectDeviceDialog open={connectOpen} onClose={() => setConnectOpen(false)} limitNotice={limitNotice} />
      <RevokeDeviceDialog
        device={target}
        onClose={closeRevoke}
        onConfirm={confirmRevoke}
        pending={revoke.isPending}
        error={revoke.error}
      />
    </>
  );
}
