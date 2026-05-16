import { spawn } from "node:child_process";

const target = process.env.RAILWAY_SERVICE_TARGET ?? (process.env.DATABASE_URL ? "api" : "web");

const command =
  target === "api"
    ? ["npm", ["run", "start", "--workspace", "apps/api"]]
    : ["npm", ["run", "start", "--workspace", "apps/web"]];

const [bin, args] = command;
const child = spawn(bin, args, {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
