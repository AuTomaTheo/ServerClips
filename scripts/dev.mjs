import { spawn, execSync } from "child_process";
import { existsSync, rmSync } from "fs";

/** Kill any process still bound to port 3000 (stale dev servers corrupt .next). */
function killPort3000() {
  try {
    if (process.platform === "win32") {
      const out = execSync('netstat -ano | findstr ":3000.*LISTENING"', {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const pids = new Set(
        out
          .split("\n")
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0")
      );
      for (const pid of pids) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`Stopped stale dev server (pid ${pid})`);
      }
    } else {
      execSync("lsof -ti:3000 | xargs kill -9 2>/dev/null || true", {
        shell: true,
        stdio: "ignore",
      });
    }
  } catch {
    /* port free */
  }
}

/** Remove .next if static assets are missing but server bundle exists (broken cache). */
function repairCacheIfCorrupt() {
  const nextDir = ".next";
  if (!existsSync(nextDir)) return;

  const hasServer = existsSync(`${nextDir}/server`);
  const hasCss =
    existsSync(`${nextDir}/static/css`) ||
    existsSync(`${nextDir}/static/chunks`);

  if (hasServer && !hasCss) {
    console.log("Detected corrupt .next cache — clearing...");
    rmSync(nextDir, { recursive: true, force: true });
  }
}

killPort3000();
repairCacheIfCorrupt();

const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
