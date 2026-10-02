import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { SegmentedControl } from "./ui/segmented-control";

const OPTIONS = [
  { value: "system", name: "System", icon: Monitor },
  { value: "light", name: "Light", icon: Sun },
  { value: "dark", name: "Dark", icon: Moon },
] as const;

/** Icon-only by default; `withLabels` shows the option names, for the Settings page. */
export function ThemeToggle({ className, withLabels = false }: { className?: string; withLabels?: boolean }) {
  const { preference, setPreference } = useTheme();

  return (
    <SegmentedControl<ThemePreference>
      label="Color theme"
      size={withLabels ? "md" : "sm"}
      value={preference}
      onChange={setPreference}
      className={className}
      options={OPTIONS.map(({ value, name, icon: Icon }) => ({
        value,
        label: withLabels ? (
          <>
            <Icon className="size-3.5" aria-hidden />
            {name}
          </>
        ) : (
          <Icon className="size-3.5" aria-hidden />
        ),
        ariaLabel: withLabels ? undefined : `${name} theme`,
      }))}
    />
  );
}
