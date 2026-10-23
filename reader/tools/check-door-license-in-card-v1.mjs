// THE DOOR'S LICENSES RIDE IN THE CARDS (the owner, 2026-10-19: "on the
// splash page we still serve the CC BY 4.0 which could go into the huds").
//   L1  no row of the door (a shelf's head, a book, a group of the
//       twenty-four) wears a license chip beside the reading under its name,
//       and no reading under a name carries one inside it
//   L2  every reading under a name says on its hover the record it is read
//       from and that record's license
//   L3  the card a name's word opens names that reading's license, the same
//       words its hover gives, and links its terms wherever there are terms
//       to link: the license's deed, as the postures record gives it (a
//       public-domain posture has none, and a notice-style license names no
//       deed; the card names the license alone there)
// The page is the door at the site's root, served here from the checkout
// itself (as check-door-word-card-v1 serves it), or the origin given; nothing
// here names a book (check-scope-derived S1).
// Usage: node tools/check-door-license-in-card-v1.mjs [origin]
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".css": "text/css", ".js": "text/javascript" };
const srv = /^https?:/u.test(process.argv[2] || "") ? null : createServer(async (req, res) => {
  const q = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/u, "");
  try {
    let file = join(SITE, q);
    if (!extname(q)) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
if (srv) await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const ORIGIN = srv ? `http://127.0.0.1:${srv.address().port}` : new URL(process.argv[2]).origin;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
// which license names have a deed to link, by the postures record
const DEED_BY_NAME = {};
for (const row of Object.values(JSON.parse(readFileSync("data/license-postures-v1.json", "utf8")).postures))
  if (/^https?:[/][/]/u.test(row.deed || "")) DEED_BY_NAME[row.name] = true;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${ORIGIN}/`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
// every shelf open, so every row is on the page to read
await p.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
await p.waitForTimeout(300);
const rows = await p.evaluate(() => {
  const gl = [...document.querySelectorAll(".fam-he > .g")];
  return {
    chips: document.querySelectorAll(".col-lic .chip, .fam-he .g .chip").length,
    glosses: gl.length,
    titled: gl.filter((g) => / \u00B7 [^\u00B7]+$/u.test(g.title || "")).length,
    untitled: gl.filter((g) => !/ \u00B7 [^\u00B7]+$/u.test(g.title || "")).map((g) => g.textContent.trim()).slice(0, 4),
  };
});
check("L1 no row wears a license chip beside or inside the reading under its name", rows.glosses > 0 && rows.chips === 0, `${rows.glosses} readings under names, ${rows.chips} chips`);
check("L2 every reading under a name says its record and license on its hover", rows.glosses > 0 && rows.titled === rows.glosses,
  `${rows.titled} of ${rows.glosses}${rows.untitled.length ? ` \u00B7 without: ${rows.untitled.join("; ")}` : ""}`);
// L3: open the card of the first keyed word of every name that has a reading
const n = await p.evaluate(() => [...document.querySelectorAll(".fam-he")].filter((f) => f.querySelector(":scope > .g") && f.querySelector("button.fw")).length);
const miss = [];
let seen = 0;
for (let i = 0; i < n; i += 1) {
  const want = await p.evaluate((i) => {
    const f = [...document.querySelectorAll(".fam-he")].filter((x) => x.querySelector(":scope > .g") && x.querySelector("button.fw"))[i];
    const g = f.querySelector(":scope > .g"), lic = (g.title || "").split(" \u00B7 ").pop();
    f.scrollIntoView({ block: "center" });
    f.querySelector("button.fw").click();
    return { lic, reading: g.textContent.trim() };
  }, i);
  // the card reads its records from the store: it is read once its source
  // line stands, or after a wait that says the store did not answer
  await p.waitForFunction(() => { const c = document.querySelector("#wcard:not([hidden])"); return !!(c && (c.querySelector(".d-foot .lic-chip") || /could not|no reading/u.test((c.querySelector(".r-now .v") || {}).textContent || ""))); }, null, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(150);
  // the license is the one the card's source line wears, and the terms are
  // that line's own link: a link elsewhere on the card (the book's) is not it
  const card = await p.evaluate(() => { const c = document.querySelector("#wcard:not([hidden])"); return c ? { lic: ((c.querySelector(".d-foot .lic-chip") || {}).textContent || "").trim(), terms: !!c.querySelector(".d-foot a[href]") } : null; });
  seen += 1;
  if (!card || card.lic !== want.lic || (!card.terms && DEED_BY_NAME[want.lic])) miss.push(`"${want.reading}" (${want.lic}): ${card ? (card.lic === want.lic ? "no terms" : `the source line wears "${card.lic}"`) : "no card"}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  await p.evaluate(() => { const x = document.querySelector("#wcard:not([hidden]) button[aria-label], #wcard:not([hidden]) .x"); if (x) x.click(); });
}
check("L3 the card a name's word opens names the reading's license, and links its terms where the license has a deed", seen > 0 && !miss.length, `${seen} cards${miss.length ? ` \u00B7 ${miss.slice(0, 6).map((m) => m.replace(/^"(.{0,40})[^"]*"/u, "\"$1\"")).join("; ") + ` (${miss.length} of ${seen})`}` : ""}`);
await b.close();
if (srv) srv.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
