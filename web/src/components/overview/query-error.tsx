import type { ApiError } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  /** What failed to load, e.g. "Could not load your devices". */
  title: string;
  error: ApiError | null;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

/** Danger alert for a failed query, with a retry button. */
export function QueryError({ title, error, onRetry, retrying = false, className }: QueryErrorProps) {
  return (
    <Alert
      tone="danger"
      title={title}
      className={className}
      action={
        <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      }
    >
      {error?.message || "Something went wrong on our side. Try again in a moment."}
    </Alert>
  );
}
