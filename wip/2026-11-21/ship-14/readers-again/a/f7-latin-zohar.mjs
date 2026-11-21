// Finding 7, met at rest: the Tikkunei Zohar's page (a work the record of dictionaries does not rest shut, pointing
// "keep"). Second visit after a first visit on which the Samaritan overlay's index was aborted once (fail), or
// after a clean first visit (ok). The first words of the work whose key Uhlemann (MSAM2, Latin) has a row for are
// opened until a card shows a pill of his.
// node f7-latin-zohar.mjs fail|ok [section index] [word index]
import { chromium, BASE, ready, waitCard, U } from "./lib.mjs";
import { readFileSync } from "node:fs";
const [mode, SIa, WIa] = process.argv.slice(2);
const KEYS = Object.keys(JSON.parse(readFileSync(new URL("./msam2-keys.json", import.meta.url), "utf8")));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
if (mode === "fail") await p.route("**/data/overlays/samaritan/index.json", (route) => route.abort("failed"));
await p.goto(`${BASE}?b=tikkunei-zohar`, { waitUntil: "networkidle" }); await ready(p);
console.log("visit 1:", JSON.stringify(await p.evaluate(() => ({ off: window.__sourcesOff, overlays: window.__overlays, stamp: localStorage.getItem("fh.sources.defaults") }))));
await p.unroute("**/data/overlays/samaritan/index.json").catch(() => {});
await p.reload({ waitUntil: "networkidle" }); await ready(p);
console.log("visit 2:", JSON.stringify(await p.evaluate(() => ({ off: window.__sourcesOff, overlays: window.__overlays, stamp: localStorage.getItem("fh.sources.defaults"), restShutHere: window.__kindsHere, pointing: window.__masorah }))));
const cands = SIa !== undefined ? [{ si: Number(SIa), wi: Number(WIa) }] : await p.evaluate((keys) => { const K = new Set(keys); const z = window.__zone; const out = []; const seen = new Set(); for (let si = 0; si < z.sections.length && out.length < 30; si += 1) z.sections[si].words.forEach((w, wi) => { if (w.k && !w.kq && K.has(w.k) && !seen.has(w.k) && out.length < 30) { seen.add(w.k); out.push({ si, wi }); } }); return out; }, KEYS);
for (const at of cands) {
  const lab = await p.evaluate(async ({ si, wi }) => { const el = document.getElementById(`s${si}`); el.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 900)); const z = window.__zone; const wb = [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === z.sections[si].words[wi]); if (!wb) return null; (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return `${z.sections[si].label} word ${wi + 1} ${z.sections[si].words[wi].k}`; }, at);
  if (!lab) continue;
  await waitCard(p);
  const r = await p.evaluate(() => { const by = window.__poolBy || []; const pool = window.__pool || []; const i = by.findIndex((x) => x.split(" ").includes("MSAM2")); const note = [...document.querySelectorAll("#hud .rows p")].map((x) => x.textContent.trim()).find((t) => /withheld by your source switches/u.test(t)) || ""; return { pills: pool.length, i, text: i >= 0 ? pool[i] : "", lit: i >= 0 ? [...document.querySelectorAll("#hud .b-read .r-pills button")].findIndex((x) => x.textContent.trim() === pool[i].trim()) : -1, note: note.slice(0, 80) }; });
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  if (r.i >= 0 || SIa !== undefined) { console.log(`card at ${U(lab)} (section ${at.si}, word index ${at.wi}): ${r.pills} pills; Uhlemann's: ${r.i >= 0 ? `pill ${r.i + 1} ${JSON.stringify(U(r.text).slice(0, 150))} (drawn as button ${r.lit + 1})` : "none"}${r.note ? ` | card says: ${r.note}` : ""}`); break; }
}
await b.close();
