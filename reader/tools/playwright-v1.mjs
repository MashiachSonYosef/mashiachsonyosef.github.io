// Synthesis lane · where playwright stands is asked, never assumed
//
// Twenty checks each typed the absolute path of one machine's playwright
// install, and the day the suite ran on any other machine all twenty died
// FAILED — which reads as the site being broken when it is the harness that
// moved. Resolution order: a real install visible from here (the bare
// specifier), then the machines this lane has run on, named as candidates.
// A miss is exit 3 — the suite's "could not reach its inputs" — never a
// crash that reads as a finding.
import { existsSync } from "node:fs";

const CANDIDATES = [
  "playwright",
  "/opt/node22/lib/node_modules/playwright/index.js",
  "/home/claude/.npm-global/lib/node_modules/playwright/index.js",
];
export const loadPlaywright = async () => {
  for (const spec of CANDIDATES) {
    try { const m = await import(spec); return m.default ?? m; } catch { /* the next candidate answers */ }
  }
  console.log("SKIPPED — playwright is not reachable on this machine");
  process.exit(3);
};

// The browser the harness launches: a pinned browser directory where one
// exists (this lane's containers carry chromium there); anywhere else,
// playwright resolves its own installed browser.
const PINNED = "/opt/pw-browsers/chromium";
export const launchOptions = () => (existsSync(PINNED) ? { executablePath: PINNED } : {});
