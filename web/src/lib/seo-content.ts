/** Shared copy for <Seo>, Open Graph, and schema.org JSON-LD. Keep answers plain text. */

export const HOME_TITLE = "SkillManager: AI agents for Claude Code, Codex, Cursor & Gemini CLI";

export const HOME_DESCRIPTION =
  "Install and sync AI agents, skills, and rules into Claude Code, Codex, Cursor, and Gemini CLI with one CLI. Free for one machine with a generous catalog; Pro for unlimited devices and Pro-only agents. No card required to start.";

export const PRICING_TITLE = "Pricing | SkillManager";

export const PRICING_DESCRIPTION =
  "Compare Free and Pro plans for SkillManager. Free covers one machine and a generous catalog. Pro adds unlimited machines, every agent, and — soon — publish and earn from your own agents.";

/** FAQ entries used both on the page and in FAQPage structured data. */
export const SEO_FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "Which coding tools are supported?",
    answer:
      "Claude Code, Codex, Cursor, and Gemini CLI. sm install asks which ones you use, or you can name them with --tools claude,codex,cursor,gemini.",
  },
  {
    question: "Where are the files written?",
    answer:
      "In the project you run sm install from, or in your home directory with --global. Claude Code gets files in .claude/agents, .claude/skills, and .claude/rules. Cursor gets .cursor/rules/<name>.mdc files. Codex and Gemini CLI get a marked section in AGENTS.md and GEMINI.md.",
  },
  {
    question: "What happens to files I edited?",
    answer:
      "SkillManager records a content hash for each file it installs. If a file changed since then, sm install asks before overwriting it. In scripts the file is skipped unless you pass --force.",
  },
  {
    question: "How many machines can I connect?",
    answer:
      "One on the Free plan. Pro has no device limit. The Devices page shows when each machine was last used and lets you revoke it.",
  },
  {
    question: "How do I remove an agent?",
    answer:
      "Run sm remove <slug>. Its own files are deleted and its marked sections are taken out of shared files, leaving the rest of those files unchanged.",
  },
  {
    question: "How do I cancel Pro?",
    answer:
      "Open Billing in your dashboard and go to the Stripe billing portal to cancel or change your payment method.",
  },
  {
    question: "Can I publish my own agents?",
    answer:
      "Not yet. Publishing agents and earning from their usage is coming soon on Pro. Free stays focused on installing from the catalog.",
  },
];
