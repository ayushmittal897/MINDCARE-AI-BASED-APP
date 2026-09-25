import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const isWindows = process.platform === "win32";

// Load root .env file
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Extract ports
const VITE_PORT = parseInt(process.env.VITE_DEV_PORT || "5173", 10);
const API_PORT = parseInt(process.env.PORT || "4000", 10);
let ML_PORT = 8010;

if (process.env.ML_CORE_URL) {
  try {
    const url = new URL(process.env.ML_CORE_URL);
    if (url.port) {
      ML_PORT = parseInt(url.port, 10);
    }
  } catch (e) {
    // Ignore invalid URL
  }
}

const portsToKill = [VITE_PORT, API_PORT, ML_PORT];

function getPidsOnPort(port) {
  const pids = new Set();
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.split("\n").map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid !== "0") {
            pids.add(pid);
          }
        }
      }
    } else {
      const output = execSync(`lsof -i :${port} -t`).toString();
      const lines = output.split("\n").map(l => l.trim()).filter(Boolean);
      for (const pid of lines) {
        pids.add(pid);
      }
    }
  } catch (error) {
    // Ignore errors when port is not in use
  }
  return Array.from(pids);
}

function killPid(pid) {
  try {
    if (isWindows) {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    console.log(`\x1b[32m[OK]\x1b[0m Killed PID ${pid}`);
    return true;
  } catch (error) {
    console.log(`\x1b[31m[ERROR]\x1b[0m Failed to kill PID ${pid}`);
    return false;
  }
}

console.log("Searching for services to stop...");

let foundProcesses = false;

for (const port of portsToKill) {
  const pids = getPidsOnPort(port);
  if (pids.length > 0) {
    foundProcesses = true;
    console.log(`Found processes on port ${port}: ${pids.join(", ")}`);
    for (const pid of pids) {
      killPid(pid);
    }
  }
}

if (!foundProcesses) {
  console.log("No running services found on required ports.");
} else {
  console.log("Finished stopping services.");
}
