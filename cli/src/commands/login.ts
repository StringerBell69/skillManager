import * as p from "@clack/prompts";
import pc from "picocolors";
import open from "open";
import { startDeviceFlow, pollDeviceFlow } from "../api-client.js";
import { saveToken, loadToken, getHostname, isInteractive } from "../config.js";

export async function loginCommand() {
  // Check if already logged in
  const existing = loadToken();
  if (existing) {
    p.log.info("You are already logged in. Run " + pc.cyan("sm logout") + " first to switch accounts.");
    return;
  }

  const isTTY = isInteractive();

  if (isTTY) {
    p.intro(pc.bgCyan(pc.black(" SkillManager Login ")));
  }

  // Start device flow
  let flow;
  try {
    flow = await startDeviceFlow(getHostname());
  } catch (err: any) {
    if (isTTY) {
      p.log.error(`Failed to start login: ${err.message}`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }

  // Show user code prominently
  if (isTTY) {
    p.log.info(
      `Open the browser and enter this code:\n\n` +
        `  ${pc.bold(pc.cyan(pc.underline(flow.userCode)))}\n\n` +
        `Or visit: ${pc.dim(flow.verificationUrl)}`,
    );
  } else {
    console.log(`User code: ${flow.userCode}`);
    console.log(`Verification URL: ${flow.verificationUrl}`);
  }

  // Try to open the browser
  try {
    await open(flow.verificationUrl);
    if (isTTY) p.log.info("Browser opened automatically.");
  } catch {
    if (isTTY) p.log.warn("Could not open browser. Please visit the URL above manually.");
  }

  // Poll until approved, denied, or expired
  if (isTTY) {
    const spinner = p.spinner();
    spinner.start("Waiting for approval...");

    const startTime = Date.now();
    const timeoutMs = flow.expiresIn * 1000;

    while (Date.now() - startTime < timeoutMs) {
      await sleep(flow.interval * 1000);

      try {
        const result = await pollDeviceFlow(flow.deviceCode);

        if (result.status === "approved" && result.token) {
          saveToken(result.token);
          spinner.stop("Logged in successfully!");
          p.outro(pc.green("✓ You are now logged in."));
          return;
        }

        if (result.status === "denied") {
          spinner.stop("Login denied.");
          p.log.error("The login request was denied.");
          process.exit(1);
        }

        if (result.status === "expired") {
          spinner.stop("Code expired.");
          p.log.error("The code has expired. Please run " + pc.cyan("sm login") + " again.");
          process.exit(1);
        }

        // status === "pending", continue polling
      } catch (err: any) {
        spinner.stop("Error");
        p.log.error(`Polling failed: ${err.message}`);
        process.exit(1);
      }
    }

    spinner.stop("Timed out.");
    p.log.error("Login timed out. Please try again.");
    process.exit(1);
  } else {
    // Non-interactive polling
    const startTime = Date.now();
    const timeoutMs = flow.expiresIn * 1000;

    while (Date.now() - startTime < timeoutMs) {
      await sleep(flow.interval * 1000);

      try {
        const result = await pollDeviceFlow(flow.deviceCode);

        if (result.status === "approved" && result.token) {
          saveToken(result.token);
          console.log("Logged in successfully.");
          return;
        }
        if (result.status === "denied") {
          console.error("Login denied.");
          process.exit(1);
        }
        if (result.status === "expired") {
          console.error("Code expired.");
          process.exit(1);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    }
    console.error("Login timed out.");
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
