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

const portsToCheck = [
  { name: "Frontend", port: VITE_PORT },
  { name: "Backend", port: API_PORT },
  { name: "ML Core", port: ML_PORT },
];

function checkPort(port) {
  try {
    let output;
    if (isWindows) {
      // netstat -ano | findstr :<port> | findstr LISTENING
      output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString();
    } else {
      // lsof -i :<port>
      output = execSync(`lsof -i :${port}`).toString();
    }
    return output.trim();
  } catch (error) {
    // Command fails if no output is found (which means port is free)
    return null;
  }
}

let hasError = false;

console.log("Checking required ports...");

for (const { name, port } of portsToCheck) {
  const result = checkPort(port);
  if (result) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${name} port ${port} is already in use.`);
    
    // Attempt to parse PID
    if (isWindows) {
      const lines = result.split("\n").map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.split(/\s+/);
          const pid = parts[parts.length - 1];
          console.error(`       -> Held by PID: ${pid}`);
        }
      }
    } else {
      const lines = result.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        const pid = parts[1];
        console.error(`       -> Held by PID: ${pid}`);
      }
    }
    hasError = true;
  } else {
    console.log(`\x1b[32m[OK]\x1b[0m ${name} port ${port} is free.`);
  }
}

if (hasError) {
  console.error("\nPlease stop the conflicting processes or use 'npm run stop' before running 'npm run dev'.");
  process.exit(1);
}

console.log("All ports are free. Starting services...\n");
