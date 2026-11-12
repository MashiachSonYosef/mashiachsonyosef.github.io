// What one word's card withholds under "only this pointing", and from whom: the card's own count, its readings with
// their sources, and, read from the served store, every row of the word's key whose source the card does not show,
// with that row's own headwords beside the word as the text points it.
// node card-withheld.mjs <reader dir> <zone url base> <book> <section index> <word number, marks not counted, from 1>
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, base, book, secArg, wordArg] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const LABELS = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(reader, "data", "route-store", "index.json"), "utf8")).m_sources || {}).map(([id, m]) => [id, m.label || ""]));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
const word = await p.evaluate(async ({ i, n }) => {
  const s = document.getElementById(`s${i}`);
  for (let g = 0; g < 300 && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
  const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
  wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  return { label: (s.querySelector(".vnum") || {}).textContent || "", s: wb.__word ? wb.__word.s : "", k: wb.__word ? wb.__word.k : "" };
}, { i: Number(secArg), n: Number(wordArg) });
const t0 = Date.now(); while (Date.now() - t0 < 9000 && !(await p.$("#hud .b-read .r-pills button"))) await p.waitForTimeout(80);
await p.waitForTimeout(600);
const card = await p.evaluate(() => {
  const hud = document.getElementById("hud");
  const notes = [...hud.querySelectorAll(".b-read p, .b-read .note, .b-read .kq-role")].map((x) => x.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
  return { gradedBy: window.__cardGradedBy || "", pool: window.__pool || [], by: window.__poolBy || [], notes, withheld: (hud.querySelector(".b-read .r-pills") || { dataset: {} }).dataset };
});
// the store's rows for the key, straight from the served shard
const rows = await p.evaluate(async (k) => {
  const ix = await (await fetch("data/route-store/index.json")).json();
  const hex = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(k)))[0].toString(16).padStart(2, "0");
  const res = await fetch(`data/route-store/shards/${hex}.bin?v=${ix.store_version}`);
  const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
  return (JSON.parse(text)[k] || []).map((r) => ({ text: String(r[1]).slice(0, 60), m: r[3], y: r[4], heads: Array.isArray(r[6]) ? r[6] : null }));
}, word.k).catch((e) => ({ error: String(e) }));
console.log(`${book} ${word.label} word ${wordArg} · ${word.s} (key ${word.k}) · the card grades by ${JSON.stringify(card.gradedBy)}`);
console.log(`  the card: ${card.pool.length} readings · ${Object.entries(card.withheld).map(([k, v]) => `${k}=${v}`).join(" ")}`);
for (const n of card.notes.slice(0, 6)) console.log(`     says: ${n.slice(0, 200)}`);
const shown = new Set(card.by.flatMap((x) => String(x).split(" ")));
console.log(`  first readings: ${card.pool.slice(0, 6).map((t, i) => `${JSON.stringify(t)} by ${card.by[i]}`).join(" · ")}`);
if (Array.isArray(rows)) {
  const off = rows.filter((r) => !shown.has(r.m));
  console.log(`  the store holds ${rows.length} rows under this key from ${new Set(rows.map((r) => r.m)).size} sources; ${off.length} rows are of sources the card shows nothing from:`);
  for (const r of off.slice(0, 14)) console.log(`     ${r.m} ${(LABELS[r.m] || "").slice(0, 50)} · ${JSON.stringify(r.text)} · its own headwords: ${r.heads ? r.heads.join(" | ") : "none carried"}`);
} else console.log(`  the store's rows could not be read here: ${rows.error}`);
await b.close();
