// read-only (23 November 2026): the cards at named places (book, verse label, word number from 1), as a first visit
// finds them, read off the page of one reader tree served on a port the machine gives; printed as JSON lines.
// Usage: node cards-at-19.mjs <reader dir> <book:label:word> ...
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, ...ASK] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const { linesOnPage } = await import(join(R, "tools", "resting-lines-v1.mjs"));
const { cardInPage } = await import(join(R, "tools", "gated-card-v1.mjs"));
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const tree = await serveTree(R);
try {
  for (const a of ASK) {
    const [book, label, word] = a.split(":").length === 4 ? [a.split(":")[0], a.split(":").slice(1, 3).join(":"), a.split(":")[3]] : a.split(":");
    const zone = gz(join(R, "data", "zones", `${book}.bin`));
    const si = zone.sections.findIndex((s) => String(s.label) === label), e = Number(word) - 1;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const p = await ctx.newPage();
    await p.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    const lines = await linesOnPage(p, { from: si, to: si + 1 });
    const unit = (lines.sections[0].units || []).find((u) => u[0] <= e && e < u[0] + Math.max(1, u[1])) || null;
    const got = await p.evaluate(cardInPage, { section: si, entry: e });
    console.log(JSON.stringify({ at: a, s: zone.sections[si].words[e].s, line: unit ? [unit[2], unit[3]] : null, pills: (got.said || []).map((x) => `${x[0]} (${x[1]})`), withheld_line: got.line, fault: got.fault || null }));
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
