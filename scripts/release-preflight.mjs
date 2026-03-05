import fs from "node:fs";

function fail(message) {
  console.error(`release preflight failed: ${message}`);
  process.exit(1);
}

const pkgRaw = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
const pkg = JSON.parse(pkgRaw);
const changelog = fs.readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");

const requiredStringFields = [
  "name",
  "displayName",
  "description",
  "version",
  "publisher",
  "license",
  "icon",
  "homepage"
];

for (const field of requiredStringFields) {
  if (typeof pkg[field] !== "string" || pkg[field].trim().length === 0) {
    fail(`package.json field "${field}" is required`);
  }
}

if (!pkg.repository || typeof pkg.repository.url !== "string" || pkg.repository.url.trim().length === 0) {
  fail("package.json.repository.url is required");
}

if (!pkg.bugs || typeof pkg.bugs.url !== "string" || pkg.bugs.url.trim().length === 0) {
  fail("package.json.bugs.url is required");
}

if (!pkg.engines || typeof pkg.engines.vscode !== "string" || pkg.engines.vscode.trim().length === 0) {
  fail("package.json.engines.vscode is required");
}

if (!Array.isArray(pkg.keywords) || pkg.keywords.length < 3) {
  fail("package.json.keywords must contain at least 3 entries");
}

if (!Array.isArray(pkg.activationEvents) || pkg.activationEvents.length === 0) {
  fail("package.json.activationEvents must not be empty");
}

if (!Array.isArray(pkg.contributes?.commands) || pkg.contributes.commands.length === 0) {
  fail("package.json.contributes.commands must not be empty");
}

if (!fs.existsSync(new URL(`../${pkg.icon}`, import.meta.url))) {
  fail(`icon file "${pkg.icon}" does not exist`);
}

const versionHeading = new RegExp(`^##\\s+${pkg.version.replace(/\./g, "\\.")}\\s+-\\s+\\d{4}-\\d{2}-\\d{2}\\s*$`, "m");
if (!versionHeading.test(changelog)) {
  fail(`CHANGELOG.md must contain heading "## ${pkg.version} - YYYY-MM-DD"`);
}

console.log(`release preflight passed for version ${pkg.version}`);
