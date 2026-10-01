import * as p from "@clack/prompts";
import pc from "picocolors";
import { deleteToken, loadToken, isInteractive } from "../config.js";

export async function logoutCommand() {
  const token = loadToken();

  if (!token) {
    if (isInteractive()) {
      p.log.info("You are not logged in.");
    } else {
      console.log("Not logged in.");
    }
    return;
  }

  deleteToken();

  if (isInteractive()) {
    p.log.success(pc.green("Logged out successfully."));
  } else {
    console.log("Logged out.");
  }
}
