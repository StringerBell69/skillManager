import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { SegmentedControl } from "./ui/segmented-control";

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <SegmentedControl<ThemePreference>
      label="Color theme"
      size="sm"
      value={preference}
      onChange={setPreference}
      className={className}
      options={[
        { value: "system", label: <Monitor className="size-3.5" aria-hidden />, ariaLabel: "System theme" },
        { value: "light", label: <Sun className="size-3.5" aria-hidden />, ariaLabel: "Light theme" },
        { value: "dark", label: <Moon className="size-3.5" aria-hidden />, ariaLabel: "Dark theme" },
      ]}
    />
  );
}
