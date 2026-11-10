#!/usr/bin/env node
// RUN: tree
// GUARDS: work-status-rule-v1-a-work-the-owner-calls-in-progress-says-so-on-the-door-and-on-every-page-of-it
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RULE. A work the owner has called in progress says so: its row on the
// door wears the status beside its name, and every page of the work says so
// under its title, in the note of the owner's ruling file
// (data/work-status-v1.json), with the count of its words that have an
// English reading, read from the work's own zone. The owner, 2026-11-08, on
// the Tikkunei Zohar: mark it in progress. A work leaves the file when the
// owner says it is done, and then nothing of this may linger.
//
// The laws:
//
//   W1  the ruling file names only works the shelf serves (a zone and pages
//       of their own), each with a status and a note
//   W2  the door carries the status beside each marked work's name, right
//       after the link that opens it, and no status anywhere else
//   W3  every page of a marked work carries the status and the note as metas,
//       exactly as the file words them, and no page of any other work
//       carries either
//   W4  in a browser, a marked work's page shows the line under its title: the
//       status, the note, and the zone's own count of words with an English
//       reading; an unmarked work's page keeps the line hidden
//
// Usage: node tools/check-work-status-v1.mjs [--root <repository root>]
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ROOT = arg("root", join(HERE, "..", ".."));
const READER = join(ROOT, "reader");
const FILE = join(READER, "data", "work-status-v1.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
if (!existsSync(FILE)) { console.log("SKIPPED — no data/work-status-v1.json; no work is marked"); process.exit(3); }
const ws = JSON.parse(readFileSync(FILE, "utf8"));
const marked = Object.entries(ws.works || {});
const htmlAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const zoneOf = (slug) => { const p = join(READER, "data", "zones", `${slug}.bin`); return existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : null; };

// W1
{
  const faults = [];
  for (const [slug, s] of marked) {
    const z = zoneOf(slug);
    if (!z) faults.push(`${slug}: no zone on the shelf`);
    if (!existsSync(join(ROOT, slug, "index.html"))) faults.push(`${slug}: no page of its own`);
    if (!s.status || !s.note) faults.push(`${slug}: no status or no note`);
  }
  check("W1 the ruling file names only served works, each with a status and a note", marked.length > 0 && !faults.length,
    faults.length ? faults.join(" · ") : `${marked.length} marked: ${marked.map(([slug, s]) => `${slug} (${s.status})`).join(", ")}`);
}

// W2
{
  const door = readFileSync(join(ROOT, "index.html"), "utf8");
  const faults = [];
  for (const [slug, s] of marked) {
    const re = new RegExp(`href="/${slug}" title="open this book">[^<]*</a><span class="wip" title="[^"]*">${s.status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`);
    if (!re.test(door)) faults.push(`${slug}: no status beside its name`);
  }
  const tags = (door.match(/<span class="wip"/g) || []).length;
  if (tags !== marked.length) faults.push(`${tags} status tags on the door for ${marked.length} marked works`);
  check("W2 the door carries the status beside each marked work's name, and nowhere else", !faults.length, faults.length ? faults.join(" · ") : `${tags} tag(s)`);
}

// W3: every reader page under the repository root, by the work it names
{
  const SKIP = new Set(["reader", "wip", "chain", "node_modules", ".git", "data", "deploy-root"]);
  const pages = [];
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith(".")) continue;
      const d = join(dir, e.name);
      const f = join(d, "index.html");
      if (existsSync(f)) pages.push(f);
      if (depth < 2) walk(d, depth + 1);
    }
  };
  walk(ROOT, 0);
  const want = new Map(marked);
  const faults = [];
  let carried = 0, readerPages = 0;
  for (const f of pages) {
    const html = readFileSync(f, "utf8");
    const book = (html.match(/<meta name="reader-book" content="([^"]*)">/) || [])[1];
    if (!book) continue;
    readerPages += 1;
    const st = (html.match(/<meta name="reader-status" content="([^"]*)">/) || [])[1];
    const note = (html.match(/<meta name="reader-status-note" content="([^"]*)">/) || [])[1];
    const s = want.get(book);
    if (s) {
      if (st !== htmlAttr(s.status) || note !== htmlAttr(s.note)) faults.push(`${f.slice(ROOT.length)}: ${st === undefined ? "no status" : "status or note not the file's"}`);
      else carried += 1;
    } else if (st !== undefined || note !== undefined) faults.push(`${f.slice(ROOT.length)}: a status on ${book}, which the file does not mark`);
  }
  check("W3 every page of a marked work carries the status and the note, and no other page does", carried > 0 && !faults.length,
    faults.length ? faults.slice(0, 6).join(" · ") + (faults.length > 6 ? ` · and ${faults.length - 6} more` : "") : `${carried} page(s) carry it · ${readerPages} reader pages read`);
}

// W4: the browser
{
  const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" };
  const srv = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    try {
      let file = join(ROOT, p);
      if (!extname(p) || (existsSync(file) && statSync(file).isDirectory())) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end("no"); }
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch(launchOptions());
  const faults = [];
  const seen = [];
  try {
    for (const [slug, s] of marked) {
      const z = zoneOf(slug);
      const c = (z && z.counts) || {};
      const p = await browser.newPage({ viewport: { width: 412, height: 915 } });
      await p.goto(`${base}/${slug}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
      const shown = await p.waitForSelector("#statusLine:not([hidden])", { timeout: 120000 }).then(() => true).catch(() => false);
      const text = shown ? (await p.textContent("#statusLine")).replace(/\s+/g, " ").trim() : "";
      const label = s.status.charAt(0).toUpperCase() + s.status.slice(1);
      const count = `So far ${Number(c.glossed_words).toLocaleString("en-US")} of its ${Number(c.words).toLocaleString("en-US")} words have an English reading.`;
      if (!shown) faults.push(`/${slug}/: the line stays hidden`);
      else if (!text.startsWith(label) || !text.includes(s.note) || !text.includes(count)) faults.push(`/${slug}/: the line reads «${text.slice(0, 200)}»`);
      else seen.push(`/${slug}/: «${text.slice(0, 160)}»`);
      await p.close();
    }
    // an unmarked work keeps the line hidden: the first served book the file does not mark
    const other = readdirSync(join(READER, "data", "zones")).map((f) => f.replace(/\.bin$/, "")).filter((b) => !b.includes(".") && !(ws.works || {})[b] && existsSync(join(ROOT, b, "index.html"))).sort()[0];
    if (other) {
      const p = await browser.newPage({ viewport: { width: 412, height: 915 } });
      await p.goto(`${base}/${other}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
      await p.waitForFunction(() => !/^Loading/.test((document.getElementById("meta") || {}).textContent || ""), null, { timeout: 120000 }).catch(() => {});
      const hidden = await p.evaluate(() => { const el = document.getElementById("statusLine"); return !!el && el.hidden; });
      if (!hidden) faults.push(`/${other}/: the line shows on a work the file does not mark`);
      else seen.push(`/${other}/: hidden`);
      await p.close();
    }
  } finally {
    await browser.close();
    srv.close();
  }
  check("W4 a marked work's page shows the line with the zone's own count; an unmarked work's keeps it hidden", !faults.length, faults.length ? faults.join(" · ") : seen.join(" · "));
}

console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
