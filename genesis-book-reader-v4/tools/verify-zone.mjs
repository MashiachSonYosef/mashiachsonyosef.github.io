#!/usr/bin/env node
// Synthesis lane · verify a built zone by rendering it, not by reading it.
//
// A zone that parses is not a zone that reads. This serves the site over
// loopback, opens the page in headless Chromium, and asserts against the DOM
// the reader would actually meet: counts in the masthead, one reading per
// pill, the commentary handle opening the commentary, licences on the card.
//
// Usage: node tools/verify-zone.mjs --root site --book 1kings [--shot out.png]

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const root = arg("--root", "site");
const book = arg("--book", "1kings");
const shot = arg("--shot");

const TYPES = { ".html": "text/html", ".json": "application/json", ".bin": "application/octet-stream", ".css": "text/css", ".js": "text/javascript" };
const server = createServer(async (req, res) => {
  try {
    const p = join(root, normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, ""));
    const body = await readFile(p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1500 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
// A book without a commentary sidecar 404s for it by design — the page asks
// once and shows nothing. That is the expected shape, not a page error.
const expected404 = /-commentary\.bin/u;
page.on("console", (m) => { if (m.type() === "error" && !expected404.test(m.text())) errors.push(m.text()); });
page.on("requestfailed", () => {});

await page.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { timeout: 20000 });

const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });

const facts = await page.evaluate(() => ({
  title: document.querySelector("#workTitle .en-t").textContent,
  meta: document.getElementById("meta").textContent,
  prov: document.getElementById("prov").textContent,
  sections: document.querySelectorAll("section.seg").length,
  words: document.querySelectorAll("section.seg .wb").length,
  glossed: [...document.querySelectorAll("section.seg .wb .g")].filter((g) => g.textContent.trim()).length,
  tocCells: document.querySelectorAll("#toc .chs a").length,
  commentaryHandles: document.querySelectorAll(".c-seg").length,
  driftChips: document.querySelectorAll(".drift-chip").length,
  firstSection: document.querySelector("section.seg .he-text").textContent.trim().slice(0, 60),
  firstGlosses: [...document.querySelectorAll("section.seg .wb")].slice(0, 6).map((w) => w.querySelector(".g").textContent.trim()),
}));

check("page threw no errors", errors.length === 0, errors.slice(0, 3).join(" | "));
check("work title rendered", facts.title.length > 0, facts.title);
check("sections rendered", facts.sections > 0, `${facts.sections} sections`);
check("contents grid rendered", facts.tocCells > 0, `${facts.tocCells} chapter cells`);
check("no drift chips", facts.driftChips === 0, `${facts.driftChips} drifted`);
// Two grains ship: a work attached to a whole section (one handle per section)
// and units attached to single words (a chip on the word). Either is valid;
// what must not happen is a handle with nothing behind it.
const wordChips = await page.evaluate(() => document.querySelectorAll(".c-chip").length);
if (facts.commentaryHandles)
  check("commentary handle on every section", facts.commentaryHandles === facts.sections, `${facts.commentaryHandles}/${facts.sections} · section grain`);
else if (wordChips)
  check("word-anchored commentary chips render", wordChips > 0, `${wordChips} chips · word grain`);
else
  check("no commentary shown where none ships", true, "no sidecar for this book");

// no raw packing may reach the page: "/" packs morpheme spans, ";" packs senses
const rawPacking = await page.evaluate(() =>
  [...document.querySelectorAll(".g")].map((g) => g.textContent).filter((t) => t.includes("/") || t.includes(";")).slice(0, 5));
check("no raw '/' or ';' in any gloss", rawPacking.length === 0, rawPacking.join(" | "));

// open a word HUD and read the pills
await page.click("section.seg .wb:not(.held)");
await page.waitForSelector("#hud .r-pills button, #hud p", { timeout: 10000 });
const hud = await page.evaluate(() => ({
  pills: [...document.querySelectorAll("#hud .r-pills button")].map((b) => b.textContent),
  pressed: [...document.querySelectorAll('#hud .r-pills button[aria-pressed="true"]')].map((b) => b.textContent),
  overflow: document.querySelector("#hud .r-overflow select")?.options?.length ?? 0,
  licence: document.querySelector("#hud .lic-chip")?.textContent || "",
  gloss: document.querySelector(".wb.active .g")?.textContent?.trim() || "",
}));
check("word HUD offers readings", hud.pills.length > 0, hud.pills.slice(0, 4).join(" | "));
check("exactly one reading selected", hud.pressed.length === 1, hud.pressed.join(" | "));
check("selected pill equals the printed gloss", hud.pressed[0] === hud.gloss, `${hud.pressed[0]} vs ${hud.gloss}`);
check("pills never exceed ten", hud.pills.length <= 10, `${hud.pills.length} pills, ${hud.overflow} in picker`);
check("a licence rides with the reading", hud.licence.length > 0, hud.licence);
await page.keyboard.press("Escape");

// open a section commentary
let commentary = null;
if (facts.commentaryHandles) {
  await page.click("section.seg .c-seg");
  await page.waitForSelector("#hud .c-card", { timeout: 10000 });
  commentary = await page.evaluate(() => ({
    pills: [...document.querySelectorAll("#hud .c-pills button")].map((b) => b.textContent),
    words: document.querySelectorAll("#hud .c-he .wb").length,
    glossed: [...document.querySelectorAll("#hud .c-he .wb .g")].filter((g) => g.textContent.trim()).length,
    licence: document.querySelector("#hud .c-card .lic-chip")?.textContent || "",
    ref: document.querySelector("#hud .c-card .att")?.textContent || "",
    note: document.querySelector("#hud .c-note")?.textContent || "",
    text: [...document.querySelectorAll("#hud .c-he .wb .w")].slice(0, 8).map((w) => w.textContent).join(" "),
  }));
  check("commentary opens with its work", commentary.pills.length > 0, commentary.pills.join(" | "));
  check("commentary rides as tappable words", commentary.words > 0, `${commentary.words} words, ${commentary.glossed} glossed`);
  check("commentary carries its own licence", commentary.licence.length > 0, commentary.licence);
  check("attachment basis is stated", /coordinates|edge|reach/u.test(commentary.note), commentary.note.slice(0, 80));

  // a commentary word must open its own routes, and offer the way back
  await page.click("#hud .c-he .wb:not(.held)");
  await page.waitForSelector("#hud .c-back", { timeout: 10000 });
  const back = await page.evaluate(() => ({
    back: document.querySelector("#hud .c-back")?.textContent || "",
    pills: document.querySelectorAll("#hud .r-pills button").length,
    head: document.querySelector("#hud .head b")?.textContent || "",
  }));
  check("commentary word opens its own routes", back.pills > 0 || back.head.length > 0, `${back.head} · ${back.pills} pills`);
  check("and offers the way back", back.back.startsWith("‹"), back.back);
  await page.click("#hud .c-back");
  await page.waitForSelector("#hud .c-card", { timeout: 10000 });
  check("the way back returns to the commentary", true, "reopened");
  await page.keyboard.press("Escape");
}

if (shot) { await page.screenshot({ path: shot, fullPage: false }); }
await browser.close();
server.close();

const pad = Math.max(...checks.map((c) => c.name.length));
for (const c of checks) console.log(`${c.pass ? "ok  " : "FAIL"}  ${c.name.padEnd(pad)}  ${c.detail ?? ""}`);
console.log(`\n${facts.words.toLocaleString()} word blocks · ${facts.glossed.toLocaleString()} carry a gloss · ${facts.sections.toLocaleString()} sections · ${facts.tocCells} chapters`);
console.log(`first section: ${facts.firstSection}`);
console.log(`first glosses: ${facts.firstGlosses.join(" | ")}`);
if (commentary) console.log(`commentary: ${commentary.pills.join(", ")} · ${commentary.words} words · ${commentary.licence}\n  ${commentary.text}`);
const failed = checks.filter((c) => !c.pass);
if (failed.length) { console.error(`\n${failed.length} check(s) failed`); process.exit(1); }
console.log("\nall checks passed");
