/**
 * Production migrate entrypoint for Railway.
 * If the DB already has schema (Supabase / prior db push), Prisma P3005 is
 * handled once by baselining the init migration, so later deploys stay no-op
 * until a new migration is added.
 */
import { execSync } from "node:child_process";

const INIT_MIGRATION = "20260402100000_init";

function run(command: string): string {
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
}

function runCapture(command: string): { ok: boolean; output: string } {
  try {
    const output = run(command);
    return { ok: true, output };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = `${err.stdout ?? ""}${err.stderr ?? ""}${err.message ?? ""}`;
    return { ok: false, output };
  }
}

function main(): void {
  const first = runCapture("bunx prisma migrate deploy");
  process.stdout.write(first.output);

  if (first.ok) {
    return;
  }

  if (!first.output.includes("P3005")) {
    process.exit(1);
  }

  console.log(
    `Database schema is not empty (P3005). Baselining ${INIT_MIGRATION} as already applied…`,
  );
  const resolve = runCapture(
    `bunx prisma migrate resolve --applied "${INIT_MIGRATION}"`,
  );
  process.stdout.write(resolve.output);
  if (!resolve.ok) {
    process.exit(1);
  }

  const second = runCapture("bunx prisma migrate deploy");
  process.stdout.write(second.output);
  if (!second.ok) {
    process.exit(1);
  }
}

main();
