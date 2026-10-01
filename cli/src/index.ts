import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { installCommand } from "./commands/install.js";
import { updateCommand } from "./commands/update.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";

const program = new Command();

program
  .name("skillmanager")
  .description("SkillManager CLI — Install AI agents into your coding tools")
  .version("0.1.0");

program
  .command("login")
  .description("Log in to SkillManager via browser (device flow)")
  .action(loginCommand);

program
  .command("logout")
  .description("Log out and remove saved credentials")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show current user info (email, plan, status)")
  .action(whoamiCommand);

program
  .command("install")
  .description("Install agents into your project")
  .option("--tools <tools>", "Comma-separated list of tools (claude,codex,cursor,gemini)")
  .option("--global", "Install globally instead of per-project")
  .option("--project", "Install in current project (default)")
  .option("--yes", "Skip confirmation prompts")
  .option("--dry-run", "Show what would be installed without writing files")
  .option("--force", "Overwrite locally modified files without asking")
  .action(installCommand);

program
  .command("update")
  .description("Update installed agents to latest versions")
  .option("--global", "Update global installation")
  .option("--force", "Overwrite locally modified files without asking")
  .action(updateCommand);

program
  .command("list")
  .description("List installed and available agents")
  .option("--global", "List global installation")
  .action(listCommand);

program
  .command("remove <slug>")
  .description("Remove an installed agent")
  .option("--global", "Remove from global installation")
  .action(removeCommand);

// Handle errors gracefully
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err: any) {
  if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
    process.exit(0);
  }
  if (process.argv.includes("--debug")) {
    console.error(err);
  } else {
    console.error(`Error: ${err.message || err}`);
  }
  process.exit(1);
}
