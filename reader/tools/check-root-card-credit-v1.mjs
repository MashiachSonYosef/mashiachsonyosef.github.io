#!/usr/bin/env node
// A credit prints on the root card exactly as the cleared table says — and
// nowhere else, and never past its own readiness.
//
// The attribution v3 candidate (FRAME v2.7 era; counter-verified against
// the channel seals) is display cargo for the door's book cards ONLY: its
// own scope line says no README, no work page, no zone, no HUD, and its
// boundary grants no serve authority. This drives the real path in a
// browser against the real table — no fixtures, because the table is the
// record and 318 rows of it are here:
//
//   ready+ready    the credit line prints, the license link rides
//   ready+held     the credit line prints, the held state said in words,
//                  and NO link — a held link shown is distribution granted
//                  by a display card, which is exactly the category error
//   display-held   nothing prints — fail closed
//   not in table   nothing prints — absence is absence
//
// Run: node tools/check-root-card-credit-v1.mjs
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const SITE = join(K3, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const TABLE = JSON.parse(readFileSync(join(K3, "data", "work-attribution-display-v3.json"), "utf8"));
const rows = TABLE.rows || [];
const ready = (v) => String(v).startsWith("READY");
// the cases, picked by rule: the first row of each kind in table order.
// The card this drives is the door's card for a work that is NOT a book yet:
// a served work stands on the door as a link to its own page and opens no
// card there. On 2026-09-02 the fleet served 326 more works and the first
// ready row in table order became one of them, so the rule picks among rows
// whose work has no zone on the shelf — the same rows the door offers a card.
const served = new Set(zonesOnDisk(join(K3, "data", "zones")));
const unserved = (r) => !served.has(String(r.work_id || "").split("/").pop());
const caseRR = rows.find((r) => unserved(r) && ready(r.display_state) && ready(r.distribution_state) && r.license_link);
const caseRH = rows.find((r) => unserved(r) && ready(r.display_state) && !ready(r.distribution_state));
const caseHH = rows.find((r) => unserved(r) && !ready(r.display_state));
check("the table offers all three kinds to drive", !!(caseRR && caseRH && caseHH),
  [caseRR, caseRH, caseHH].map((c) => c ? c.work_id : "MISSING").join(" · "));

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json" };
const srv = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  try {
    let f = join(SITE, p);
    if (!extname(p)) f = join(f, "index.html");
    const body = await readFile(f);
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${B}/`, { waitUntil: "networkidle" });

// A work's row stands on the door while it serves and in the census
// (/census/, its own page since 2026-08-30) while it does not — one
// publication, two pages. The card machinery is identical on both, so the
// drive looks where the row lives: the door first, the census on a miss.
const openCardOnPage = (workId) => p.evaluate(async (wid) => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 120));
  const btn = document.querySelector(`button.aw[data-w="${wid.replace(/"/g, '\\"')}"]`);
  if (!btn) return { found: false };
  btn.click();
  await new Promise((r) => setTimeout(r, 1200));
  const card = document.getElementById("bkcard");
  const band = card.querySelector(".bk-att");
  const line = card.querySelector(".att-line");
  return {
    found: true,
    open: !card.hidden,
    shown: !band.hidden,
    text: (line.textContent || "").trim(),
    link: (() => { const a = line.querySelector("a"); return a ? a.getAttribute("href") : null; })(),
    held: !!line.querySelector(".att-held"),
  };
}, workId);
let onPage = "/";
const openCardFor = async (workId) => {
  let r = await openCardOnPage(workId);
  if (!r.found) {
    const other = onPage === "/" ? "/census/" : "/";
    await p.goto(`${B}${other}`, { waitUntil: "networkidle" });
    onPage = other;
    r = await openCardOnPage(workId);
  }
  return r;
};

// 1 · ready display + ready distribution: credit and link, both the table's
{
  const r = await openCardFor(caseRR.work_id);
  check(`${caseRR.work_id} — a ready row prints its credit line, verbatim`,
    r.found && r.open && r.shown && r.text.startsWith(caseRR.credit_line.trim().slice(0, 60)),
    r.found ? r.text.slice(0, 80) : "no atlas row on the door");
  check("  and its license link is the table's own", r.link === caseRR.license_link,
    r.link || "NO LINK");
}
// 2 · ready display + held distribution: credit yes, link NO, held said
{
  const r = await openCardFor(caseRH.work_id);
  check(`${caseRH.work_id} — a held distribution shows the credit and no link`,
    r.found && r.shown && r.link === null && r.held,
    r.found ? `link ${r.link} · held-note ${r.held}` : "no atlas row on the door");
  check("  the held state is said in words", r.text.includes("license link held:"),
    r.text.slice(-70));
}
// 3 · display-held: nothing, fail closed
{
  const r = await openCardFor(caseHH.work_id);
  check(`${caseHH.work_id} — a display-held work shows no attribution at all`,
    r.found && r.open && !r.shown, r.found ? `band hidden ${!r.shown}` : "no atlas row on the door");
}
// 4 · a work outside the table: nothing
{
  const inTable = new Set(rows.map((r) => r.work_id));
  const outsider = await p.evaluate((ids) => {
    const btn = [...document.querySelectorAll("button.aw[data-w]")]
      .find((x) => !ids.includes(x.getAttribute("data-w")));
    return btn ? btn.getAttribute("data-w") : null;
  }, [...inTable]);
  const r = outsider ? await openCardFor(outsider) : null;
  check("a work the table does not carry shows no attribution",
    !!r && r.open && !r.shown, outsider || "every atlas row is in the table??");
}
// 5 · the scope holds: no work page and no zone reads the table
{
  const zoneSrc = readFileSync(join(K3, "zone.html"), "utf8");
  check("the zone reader never reads the attribution table — root cards only",
    !zoneSrc.includes("work-attribution-display-v3"), "zone.html clean");
}

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
