import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex flex-wrap gap-x-3 gap-y-2 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    tone: {
      info: "border-border bg-subtle text-foreground [&>svg]:text-muted-foreground",
      success: "border-transparent bg-success-subtle text-foreground [&>svg]:text-success",
      warning: "border-transparent bg-warning-subtle text-foreground [&>svg]:text-warning",
      danger: "border-transparent bg-danger-subtle text-foreground [&>svg]:text-danger",
    },
  },
  defaultVariants: { tone: "info" },
});

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert } as const;

interface AlertProps extends Omit<ComponentProps<"div">, "title">, VariantProps<typeof alertVariants> {
  title?: ReactNode;
  action?: ReactNode;
}

export function Alert({ tone = "info", title, action, children, className, ...props }: AlertProps) {
  const Icon = ICONS[tone ?? "info"];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn(alertVariants({ tone }), className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-muted-foreground">{children}</div> : null}
      </div>
      {/* Below sm the action wraps under the text, aligned with it, so the message keeps its width. */}
      {action ? <div className="basis-full pl-7 sm:basis-auto sm:shrink-0 sm:self-center sm:pl-0">{action}</div> : null}
    </div>
  );
}
