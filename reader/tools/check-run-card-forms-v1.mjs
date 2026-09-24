#!/usr/bin/env node
// GUARDS: megacompspan-rule-v1-one-maqaf-run-one-card, weld-forms-rule-v1-a-joined-run-is-offered-in-every-form-a-source-published-and-in-no-form-it-did-not
//
// A MAQAF RUN'S CARD HOLDS ITS LATTICE: AS WRITTEN, JOINED, AND WORD BY WORD.
//
// The owner (2026-09-24): "here the 1 word is the maqaf, even if masoretics
// count it as 2, because we need to have a lattice that holds A-maqaf-B,
// AB (weld) and A+B, not just A+B." This opens the served book's runs whose
// whole forms a dictionary published, and holds the card and the line to it:
//
//   R1  every whole form of a run that the store answers is offered as a
//       division on the run's card, and no form the store does not answer
//   R2  the words one by one are always offered
//   R3  the card never opens on a joined or folded spelling (a weld can be a
//       different word: al-pi "according to" welds to a verb "to faint"),
//       and the line under the run never reads one
//   R4  where the run as written, joiner kept, is published, the line reads
//       it and the card opens on it
//
// Expected forms are computed here from the run's own keys with the corpus
// lane's enumeration (weld-forms-v1.formsOfRun) and asked of the store on
// disk — never read off the page it judges.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { formsOfRun, MAQAF } from "./weld-forms-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg("zone", "amos");
const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.bin`)).toString("utf8"));
const store = openRouteStore("data/route-store");

// the runs, from the zone's own join records
const runs = [];
for (const sec of zone.sections || []) {
  let run = [];
  for (const w of sec.words || []) {
    const pj = w.presentation_join;
    run.push(w);
    if (pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2")) continue;
    if (run.length > 1 && run.every((x) => x.k && !x.kq)) {
      const keys = run.map((x) => x.k);
      const forms = formsOfRun(keys).filter((f) => f.form !== "pieces");
      const published = forms.filter((f) => (store.routesFor(f.key) || []).length).map((f) => ({ ...f }));
      runs.push({ keys, key: keys.join(MAQAF), published, all: forms.map((f) => f.key) });
    }
    run = [];
  }
}
const withWhole = runs.filter((r) => r.published.length);
console.log(`— ${ZONE} · ${runs.length} runs · ${withWhole.length} with a whole form a dictionary published —`);
if (!withWhole.length) { console.log("SKIPPED — no run in this book has a published whole form"); process.exit(3); }

const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(async () => { let g = 0; while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 5)); g += 1; } });

const r1 = [], r3 = [], r4 = [];
let r2 = 0, looked = 0;
const seen = new Set();
for (const run of withWhole) {
  if (seen.has(run.key)) continue; seen.add(run.key);
  if (looked >= 12) break;
  looked += 1;
  const c = await p.evaluate(async (key) => {
    const r = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
    if (!r) return null;
    const line = r.querySelector(":scope > .g");
    const form = line ? line.dataset.form || "" : "";
    r.scrollIntoView({ block: "center" });
    r.querySelector(".wb .w").click();
    const t0 = Date.now(); while (Date.now() - t0 < 4000 && !document.querySelector("#hud .r-pills button, #hud .b-read p")) await new Promise((x) => setTimeout(x, 50));
    await new Promise((x) => setTimeout(x, 300));
    const h = document.getElementById("hud");
    const cuts = [...h.querySelectorAll(".b-cut .s-pills button")].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((x) => setTimeout(x, 150));
    return { form, cuts };
  }, run.key);
  if (!c) { r1.push(`${run.key}: run not drawn`); continue; }
  const offeredWhole = c.cuts.filter((x) => !x.t.includes("+")).map((x) => x.t);
  const want = run.published.map((f) => f.key);
  const missing = want.filter((k) => !offeredWhole.includes(k));
  const extra = offeredWhole.filter((k) => !want.includes(k));
  if (missing.length || extra.length) r1.push(`${run.key}: missing ${missing.join(",") || "-"} extra ${extra.join(",") || "-"}`);
  if (c.cuts.some((x) => x.t.includes("+"))) r2 += 1;
  const onWhole = c.cuts.find((x) => x.on && !x.t.includes("+"));
  if (onWhole && onWhole.t !== run.key) r3.push(`${run.key}: card opened on ${onWhole.t}`);
  if (c.form && c.form !== run.key) r3.push(`${run.key}: line reads ${c.form}`);
  const asWritten = run.published.find((f) => f.form === "maqaf");
  if (asWritten && (c.form !== run.key || !onWhole)) r4.push(`${run.key}: published as written but line "${c.form || "words"}", card on ${onWhole ? onWhole.t : "the words"}`);
}
check("R1  a run's card offers every whole form a dictionary published, and no other", r1.length === 0, r1.length ? r1.slice(0, 3).join(" | ") : `${looked} runs`);
check("R2  the words one by one are always offered", r2 === looked, `${r2} of ${looked}`);
check("R3  neither the card nor the line chooses a joined or folded spelling for the reader", r3.length === 0, r3.slice(0, 3).join(" | "));
check("R4  a run published as written reads so on its line, and its card opens there", r4.length === 0, r4.slice(0, 3).join(" | "));
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
