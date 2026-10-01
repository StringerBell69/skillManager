import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadToken, isInteractive } from "../config.js";
import { getMe, ApiClientError } from "../api-client.js";

export async function whoamiCommand() {
  const token = loadToken();

  if (!token) {
    if (isInteractive()) {
      p.log.warn("Not logged in. Run " + pc.cyan("sm login") + " first.");
    } else {
      console.error("Not logged in.");
    }
    process.exit(1);
  }

  try {
    const me = await getMe(token);

    if (isInteractive()) {
      p.log.info(
        `${pc.bold("Email:")}  ${me.email}\n` +
          `${pc.bold("Plan:")}   ${pc.cyan(me.plan)}\n` +
          `${pc.bold("Status:")} ${me.status === "ACTIVE" ? pc.green(me.status) : pc.yellow(me.status)}`,
      );
    } else {
      console.log(`Email: ${me.email}`);
      console.log(`Plan: ${me.plan}`);
      console.log(`Status: ${me.status}`);
    }
  } catch (err) {
    if (err instanceof ApiClientError) {
      handleApiError(err);
    } else {
      console.error("Error:", (err as Error).message);
    }
    process.exit(1);
  }
}

function handleApiError(err: ApiClientError) {
  switch (err.code) {
    case "TOKEN_REVOKED":
      p.log.error("Your token has been revoked. Run " + pc.cyan("sm login") + " to log in again.");
      break;
    case "TOKEN_INVALID":
      p.log.error("Invalid token. Run " + pc.cyan("sm login") + " to log in again.");
      break;
    default:
      p.log.error(err.message);
  }
}
