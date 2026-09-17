#!/usr/bin/env node
/**
 * Read .env, merge with current Amplify branch env, push via aws amplify update-branch.
 * Usage: node scripts/amplify-push-env.js [--dry-run]
 * Requires: AWS CLI, .env in project root, app id and branch in script or env.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const APP_ID = process.env.AMPLIFY_APP_ID || "d26qpea87vbbdn";
const BRANCH = process.env.AMPLIFY_BRANCH || "production";
const REGION = process.env.AWS_REGION || "us-east-2";
const DRY_RUN = process.argv.includes("--dry-run");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");

if (!fs.existsSync(envPath)) {
  console.error("No .env at", envPath);
  process.exit(1);
}

function parseEnv(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

const envVars = parseEnv(fs.readFileSync(envPath, "utf8"));
if (Object.keys(envVars).length === 0) {
  console.error(".env is empty or unreadable");
  process.exit(1);
}

let current = {};
try {
  const out = execSync(
    `aws amplify get-branch --app-id ${APP_ID} --branch-name ${BRANCH} --region ${REGION} --output json`,
    { encoding: "utf8", cwd: root }
  );
  const data = JSON.parse(out);
  current = data.branch?.environmentVariables || {};
} catch (e) {
  console.warn("Could not fetch current Amplify env:", e.message);
}

const merged = { ...current, ...envVars };

const payload = {
  appId: APP_ID,
  branchName: BRANCH,
  environmentVariables: merged,
};

const tmpFile = path.join(root, ".amplify-env-push.json");
fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), "utf8");

try {
  if (DRY_RUN) {
    console.log("Dry run. Would update", Object.keys(merged).length, "vars. Payload:", tmpFile);
    console.log("Keys:", Object.keys(merged).sort().join(", "));
    process.exit(0);
  }
  execSync(
    `aws amplify update-branch --region ${REGION} --cli-input-json file://${tmpFile}`,
    { stdio: "inherit", cwd: root }
  );
  console.log("Updated Amplify branch", BRANCH, "with", Object.keys(merged).length, "env vars.");
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
