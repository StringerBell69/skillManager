/** The command menu shortcut as people press it: "⌘K" on Apple platforms, "Ctrl K" elsewhere. */
export function commandMenuShortcut(): string {
  const agent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  return /Mac|iPhone|iPad/.test(agent) ? "⌘K" : "Ctrl K";
}
