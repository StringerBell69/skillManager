import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal built on the native <dialog> element: the browser provides the focus
 * trap, inert background, and Escape handling.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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
        // A click on the <dialog> element itself (not its content) is a backdrop click.
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-surface p-0 text-foreground shadow-float",
        "backdrop:bg-black/40 dark:backdrop:bg-black/60",
        "open:animate-[dialog-in_200ms_var(--ease-out-strong)]",
        className,
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-1.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {description ? (
          <div id={descriptionId} className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
      {footer ? (
        <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-subtle px-5 py-3 sm:flex-row sm:justify-end">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
