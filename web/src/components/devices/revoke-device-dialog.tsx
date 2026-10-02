import type { DeviceInfo } from "@skillmanager/shared/browser";
import type { ApiError } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deviceName } from "./format";

interface RevokeDeviceDialogProps {
  device: DeviceInfo | null;
  onClose: () => void;
  onConfirm: (device: DeviceInfo) => void;
  pending: boolean;
  error: ApiError | null;
}

export function RevokeDeviceDialog({ device, onClose, onConfirm, pending, error }: RevokeDeviceDialogProps) {
  const name = device ? deviceName(device) : "this device";

  return (
    <Dialog
      open={device !== null}
      onClose={onClose}
      title={`Revoke ${name}?`}
      description={
        <>
          The CLI on this device is signed out immediately. Run <code className="text-13 text-foreground">sm login</code> on
          that machine to connect it again.
        </>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={pending} onClick={() => device && onConfirm(device)}>
            Revoke device
          </Button>
        </>
      }
    >
      {error ? (
        <Alert tone="danger" title="Could not revoke this device">
          {error.message || "Something went wrong on our side. Try again in a moment."}
        </Alert>
      ) : null}
    </Dialog>
  );
}
