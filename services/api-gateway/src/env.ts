import { parse } from "dotenv";
import fs from "node:fs";
import path from "node:path";

const rootEnv = path.resolve(process.cwd(), "../../.env");
const serviceEnv = path.resolve(process.cwd(), ".env");

console.log(`[ENV_LOADER] Root .env path: ${rootEnv} (exists: ${fs.existsSync(rootEnv)})`);
console.log(`[ENV_LOADER] Service .env path: ${serviceEnv} (exists: ${fs.existsSync(serviceEnv)})`);

if (fs.existsSync(rootEnv)) {
  const parsed = parse(fs.readFileSync(rootEnv));
  for (const k in parsed) {
    process.env[k] = parsed[k];
  }
}

if (fs.existsSync(serviceEnv)) {
  const parsed = parse(fs.readFileSync(serviceEnv));
  for (const k in parsed) {
    process.env[k] = parsed[k];
  }
  const keys = Object.keys(parsed).map(k => `${k}=***`).join(", ");
  console.log(`[ENV_LOADER] Service .env keys loaded: ${keys}`);
}
