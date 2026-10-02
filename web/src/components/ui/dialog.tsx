import { useEffect, useId, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";
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

/** Matches Tailwind's `max-sm` breakpoint, where the dialog is a bottom sheet. */
const SHEET_QUERY = "(max-width: 39.99rem)";

/**
 * Lets a phone user pull the sheet down by its top edge, as on iOS. A long
 * pull or a quick flick dismisses it; anything shorter springs back.
 */
function useSheetDrag(ref: RefObject<HTMLDialogElement | null>, onDismiss: () => void) {
  const start = useRef<{ y: number; time: number } | null>(null);

  const settle = (dismiss: boolean) => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.style.transition = "transform 320ms var(--ease-sheet)";
    dialog.style.transform = dismiss ? "translateY(100%)" : "";
    if (dismiss) window.setTimeout(onDismiss, 220);
  };

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!window.matchMedia(SHEET_QUERY).matches || event.button !== 0) return;
      if ((event.target as HTMLElement).closest("button, a, input")) return;
      start.current = { y: event.clientY, time: event.timeStamp };
      event.currentTarget.setPointerCapture(event.pointerId);
      if (ref.current) ref.current.style.transition = "none";
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      if (!start.current || !ref.current) return;
      const distance = Math.max(0, event.clientY - start.current.y);
      ref.current.style.transform = `translateY(${distance}px)`;
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      if (!start.current) return;
      const distance = event.clientY - start.current.y;
      const velocity = distance / Math.max(1, event.timeStamp - start.current.time);
      start.current = null;
      settle(distance > 120 || (distance > 24 && velocity > 0.5));
    },
    onPointerCancel() {
      start.current = null;
      settle(false);
    },
  };
}

/**
 * Modal built on the native <dialog> element: the browser provides the focus
 * trap, inert background, and Escape handling. Centered on larger screens and
 * a bottom sheet on phones.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const drag = useSheetDrag(ref, onClose);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.style.transform = "";
      dialog.style.transition = "";
      dialog.showModal();
    }
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
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-card-edge bg-surface p-0 text-foreground shadow-float",
        "max-sm:mx-0 max-sm:mb-0 max-sm:mt-auto max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0",
        "backdrop:bg-black/40 dark:backdrop:bg-black/60",
        "sm:open:animate-[dialog-in_200ms_var(--ease-out-strong)] max-sm:open:animate-[sheet-in_480ms_var(--ease-sheet)]",
        className,
      )}
    >
      <div className={cn("p-5 max-sm:pt-0", !footer && "max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]")}>
        <div {...drag} className="max-sm:-mx-5 max-sm:touch-none max-sm:px-5 max-sm:pt-2">
          <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-border-strong sm:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-base font-semibold tracking-tight max-sm:pt-1 max-sm:text-[17px]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-m-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              aria-label="Close dialog"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
        {description ? (
          <div id={descriptionId} className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
      {footer ? (
        <div
          className={cn(
            "flex flex-col-reverse gap-2 border-t border-border bg-subtle px-5 py-3 sm:flex-row sm:justify-end",
            // In the sheet, the actions are full-width, thumb-sized buttons above the home indicator.
            "max-sm:border-t-0 max-sm:bg-transparent max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-sm:pt-1 max-sm:*:h-11 max-sm:*:text-[15px]",
          )}
        >
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
