#!/usr/bin/env node
// RUN: tree
// GUARDS: parts-a-press-away-rule-v1-a-whole-form-whose-every-reading-reads-it-in-its-parts-says-the-readings-of-its-parts-are-a-press-away
// LEDGER: -
// no frame letter. A check reads the store, the zones and the page, and
// judges them; it is not the ledger for one.
//
// THE WHOLE FORM OF A DIVIDED WORD SAYS WHERE ITS READINGS STAND. On the
// whole-form division of a word its place divides, the readings that read
// the form in its parts are set aside: they stand on the set's division
// (the owner's ruling of 3 October 2026). Where that left nothing and no
// switch withheld a record, the card said «No displayable route in the
// catalog for this form.», at about 40,000 places, and nothing of the
// readings a press away. The owner took card 3 of the four cards on 16
// November 2026 («ok go ahead»): it says, as a run's rung does, that no
// dictionary on this shelf gives the form whole and that the readings of
// its parts are a press away, only where that is true (zone.html, THE WHOLE
// FORM OF A DIVIDED WORD SAYS WHERE ITS READINGS STAND).
//
//   P1  at rest, on the card of a served word its place divides into pieces
//       that spell it, whose every reading the store gives for the whole
//       form reads it in its parts (a "/" in the reading): with the whole-
//       form division pressed, where the card names nothing withheld, it says
//       «No dictionary on this shelf gives this form whole. The readings of
//       its parts are a press away.», says how many readings it set aside (at
//       least one), and says nothing of «No displayable route»; and the
//       division the card opened on, pressed again, holds readings: a pill,
//       or the place's set said above them
//
// The words are found in the data, never named; up to three are judged, in
// the order of the served zones, and a word whose whole form a switch at
// rest withholds from is passed over and counted.
//
// Run: node tools/check-whole-form-parts-v1.mjs
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const SAYS = "No dictionary on this shelf gives this form whole. The readings of its parts are a press away.";
const OLD = "No displayable route in the catalog for this form.";
const WANT = 3, MOST = 24;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

console.log("— parts-a-press-away-rule-v1 —\n");
const store = openRouteStore(join(K3, "data", "route-store"));
// the candidates: a plain word its place divides into pieces that spell it, whose whole form's every reading is divided
const picks = [];
for (const b of zonesServed()) {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
  for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
    if (!w.k || w.mark || w.kq || w.w || !Array.isArray(w.pg) || w.pg.length < 2 || w.pg.map((x) => (x && x.k) || "").join("") !== w.k) continue;
    const readings = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]).flatMap((r) => store.readingsOf(r));
    if (!readings.length || !readings.every((t) => t.includes("/"))) continue;
    picks.push({ book: b, section: si, entry: e, label: sec.label, key: w.k, readings: readings.length });
    if (picks.length >= MOST) break;
  }
  if (picks.length >= MOST) break;
}
if (!picks.length) check("P1  the whole form of a divided word whose every reading reads it in its parts says its parts' readings are a press away", false, "no served word its place divides has a whole form whose every reading is divided");
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const faults = [], judged = [];
  let passed = 0, withheld = 0;
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (err) => errors.push(String(err && err.message)));
    let open = null;
    for (const pick of picks) {
      if (judged.length >= WANT) break;
      if (open !== pick.book) {
        await p.goto(`${tree.base}/zone.html?b=${pick.book}`, { waitUntil: "networkidle" });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        open = pick.book;
      }
      await linesOnPage(p, { from: pick.section, to: pick.section + 1 });
      const got = await p.evaluate(async ({ section, entry }) => {
        const hud = document.getElementById("hud");
        const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const wait = async () => { const t0 = performance.now(); while (!settled() && performance.now() - t0 < 20000) await turn(); await turn(); await turn(); return settled(); };
        const wb = (document.querySelectorAll("section.seg")[section] || document).querySelectorAll(".he-text .wb")[entry];
        if (!wb || wb.closest(".wjoin")) return { skip: "the word stands in a cell the page joins" };
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        if (!(await wait())) return { fault: "the card's readings did not arrive" };
        const divisions = () => [...hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")];
        const openedOn = divisions().find((x) => x.getAttribute("aria-pressed") === "true");
        const whole = divisions().find((x) => !x.textContent.includes("+"));
        if (!whole || !openedOn || whole === openedOn) { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return { skip: "the card does not open on a division beside the whole form" }; }
        whole.click();
        if (!(await wait())) return { fault: "the whole form's readings did not arrive" };
        const band = hud.querySelector(":scope > .rows > .b-read");
        const none = band.querySelector(":scope > p.sources-withheld");
        const said = [...band.querySelectorAll(":scope > p")].find((x) => !x.className) || null;
        const out = { withheld: none ? none.textContent : "", said: said ? said.textContent : "", inParts: said ? said.dataset.inParts || "" : "", pills: band.querySelectorAll(".r-pills button").length, text: band.textContent };
        // the division the card opened on, pressed again: its readings
        const back = divisions().find((x) => x.textContent === openedOn.textContent);
        if (back) { back.click(); await wait(); }
        out.backPills = hud.querySelectorAll(":scope > .rows > .b-read .r-pills button").length;
        out.backSet = !!hud.querySelector(":scope > .rows > .b-read .r-piece");
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        return out;
      }, { section: pick.section, entry: pick.entry });
      const where = `${pick.book} ${pick.label}, entry ${pick.entry} (${pick.key}, ${pick.readings} reading${pick.readings === 1 ? "" : "s"}, every one divided)`;
      if (got.skip) continue;
      if (got.fault) { faults.push(`${where}: ${got.fault}`); judged.push(where); continue; }
      if (got.withheld) { withheld += 1; continue; }   // a switch at rest withheld a record: the card says so, and is not this law's
      if (got.pills) { faults.push(`${where}: the whole form shows ${got.pills} reading(s), though every reading of it is divided`); judged.push(where); continue; }
      judged.push(where);
      if (got.said !== SAYS || !(Number(got.inParts) >= 1) || got.text.includes(OLD)) faults.push(`${where}: the whole form says «${got.said}»${got.inParts ? ` (in parts: ${got.inParts})` : " (it names no reading set aside)"}`);
      else if (!got.backPills && !got.backSet) faults.push(`${where}: it says its parts' readings are a press away, and the division it opened on holds no reading`);
      else passed += 1;
    }
    if (errors.length) faults.push(`the page threw: ${errors[0]}`);
    await ctx.close();
  } finally { await browser.close().catch(() => {}); await tree.close(); }
  check("P1  at rest, the whole form of a divided word whose every reading reads it in its parts, where nothing is withheld, says «No dictionary on this shelf gives this form whole. The readings of its parts are a press away.», counts what it set aside, and the division it opened on holds readings", judged.length > 0 && faults.length === 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 2).join(" · ")}` : !judged.length ? `no card of the ${picks.length} words found could be judged (${withheld} withheld by a switch at rest)` : `${passed} of ${judged.length} words judged (${judged[0]}) · ${withheld} passed over, a switch at rest withholding from the whole form`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
